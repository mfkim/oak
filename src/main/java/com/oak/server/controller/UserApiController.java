package com.oak.server.controller;

import com.oak.server.dto.UserLoginRequest;
import com.oak.server.dto.UserLoginResponse;
import com.oak.server.dto.UserSignupRequest;
import com.oak.server.jwt.JwtTokenProvider;
import com.oak.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class UserApiController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager; // 스프링 시큐리티 인증
    private final JwtTokenProvider tokenProvider;

    // 1. 회원가입 API
    @PostMapping("/signup")
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

    // 2. 로그인 API
    @PostMapping("/login")
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
}
