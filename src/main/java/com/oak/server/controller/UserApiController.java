package com.oak.server.controller;

import com.oak.server.domain.Post;
import com.oak.server.domain.Reply;
import com.oak.server.domain.SiteUser;
import com.oak.server.dto.UserLoginRequest;
import com.oak.server.dto.UserLoginResponse;
import com.oak.server.dto.UserSignupRequest;
import com.oak.server.jwt.JwtTokenProvider;
import com.oak.server.service.PostService;
import com.oak.server.service.ReplyService;
import com.oak.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.io.IOException;
import java.security.Principal;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class UserApiController {

    private final UserService userService;
    private final PostService postService;
    private final ReplyService replyService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    // 1. 회원가입 API (주소: /api/auth/signup)
    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupRequest signupRequest) {

        if (!signupRequest.getPassword().equals(signupRequest.getPasswordCheck())) {
            return ResponseEntity.badRequest().body("비밀번호가 일치하지 않습니다.");
        }

        try {
            userService.create(signupRequest.getUsername(), signupRequest.getEmail(), signupRequest.getPassword());
            return ResponseEntity.ok("회원가입 성공");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("이미 등록된 사용자입니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. 로그인 API (주소: /api/auth/login)
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody UserLoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            String token = tokenProvider.createToken(authentication.getName());

            return ResponseEntity.ok(new UserLoginResponse(token, authentication.getName()));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("아이디 또는 비밀번호가 틀렸습니다.");
        }
    }

    // 3. 프로필 이미지 변경 API (주소: /api/users/profile)
    @PutMapping("/users/profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "isImageDeleted", defaultValue = "false") boolean isImageDeleted, // ★ 추가
            Principal principal) {
        try {
            // 서비스 호출 시 isImageDeleted 전달
            SiteUser user = userService.updateProfileImage(principal.getName(), file, isImageDeleted);
            return ResponseEntity.ok(user.getProfileImg());
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("이미지 업로드 실패");
        }
    }

    // 4. 내 정보 조회 API (주소: /api/users/me)
    @GetMapping("/users/me")
    public ResponseEntity<?> getMe(Principal principal) {
        // 현재 로그인한 사용자의 정보를 DB에서 가져와서 반환
        SiteUser user = userService.getUser(principal.getName());
        return ResponseEntity.ok(user);
    }

    // 5. 내가 쓴 글 API
    @GetMapping("/users/me/posts")
    public ResponseEntity<List<Post>> getMyPosts(Principal principal) {
        SiteUser user = userService.getUser(principal.getName());
        return ResponseEntity.ok(postService.getMyPosts(user));
    }

    // 6. 내가 쓴 댓글 API
    @GetMapping("/users/me/replies")
    public ResponseEntity<List<Reply>> getMyReplies(Principal principal) {
        SiteUser user = userService.getUser(principal.getName());
        return ResponseEntity.ok(replyService.getMyReplies(user));
    }

    // 7. 내가 좋아요 한 글 API
    @GetMapping("/users/me/likes")
    public ResponseEntity<List<Post>> getMyLikes(Principal principal) {
        SiteUser user = userService.getUser(principal.getName());
        return ResponseEntity.ok(postService.getMyLikedPosts(user));
    }
}
