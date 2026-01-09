package com.oak.server.controller;

import com.oak.server.domain.Post;
import com.oak.server.domain.Reply;
import com.oak.server.domain.SiteUser;
import com.oak.server.dto.PostCreateRequest;
import com.oak.server.dto.PostModifyRequest;
import com.oak.server.dto.ReplyRequest;
import com.oak.server.service.PostService;
import com.oak.server.service.ReplyService;
import com.oak.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/posts")
public class BoardApiController {

    private final PostService postService;
    private final UserService userService;
    private final ReplyService replyService;

    // 1. 게시글 목록 조회 API
    @GetMapping("")
    public Page<Post> list(@RequestParam(value = "page", defaultValue = "0") int page,
                           @RequestParam(value = "kw", defaultValue = "") String kw) {
        return this.postService.getList(page, kw);
    }

    // 2. 게시글 상세 조회 API
    @GetMapping("/{id}")
    public Post getPost(@PathVariable Long id) {
        Post post = this.postService.findById(id);
        this.postService.increaseView(post);
        return post;
    }

    // 3. 게시글 등록 API
    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody PostCreateRequest request, Principal principal) {
        SiteUser author = this.userService.getUser(principal.getName());
        this.postService.write(request.getTitle(), request.getContent(), author);
        return ResponseEntity.ok("글 작성 성공");
    }

    // 4. 게시글 수정 API
    @PutMapping("/{id}")
    public ResponseEntity<?> modify(@PathVariable Long id,
                                    @RequestBody PostModifyRequest request,
                                    Principal principal) {
        Post post = this.postService.findById(id);
        if (!post.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정 권한이 없습니다.");
        }
        this.postService.modify(post, request.getTitle(), request.getContent());
        return ResponseEntity.ok("글 수정 성공");
    }

    // 5. 게시글 삭제 API
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {
        Post post = this.postService.findById(id);
        if (!post.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "삭제 권한이 없습니다.");
        }
        this.postService.delete(post);
        return ResponseEntity.ok("글 삭제 성공");
    }

    // 6. 게시글 추천 API
    @PostMapping("/{id}/like")
    public ResponseEntity<?> postVote(@PathVariable Long id, Principal principal) {
        Post post = this.postService.findById(id);
        SiteUser siteUser = this.userService.getUser(principal.getName());

        this.postService.vote(post, siteUser);
        return ResponseEntity.ok("추천 처리 완료");
    }

    // 7. 댓글 작성 API
    @PostMapping("/{id}/replies")
    public ResponseEntity<?> createReply(@PathVariable Long id,
                                         @RequestBody ReplyRequest request,
                                         Principal principal) {
        SiteUser siteUser = this.userService.getUser(principal.getName());
        this.replyService.write(id, request.getContent(), siteUser);
        return ResponseEntity.ok("댓글 작성 성공");
    }

    // 8. 댓글 수정 API
    @PutMapping("/replies/{replyId}")
    public ResponseEntity<?> modifyReply(@PathVariable Long replyId,
                                         @RequestBody ReplyRequest request,
                                         Principal principal) {
        Reply reply = this.replyService.findById(replyId);
        if (!reply.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정 권한이 없습니다.");
        }
        this.replyService.edit(replyId, request.getContent());
        return ResponseEntity.ok("댓글 수정 성공");
    }

    // 9. 댓글 삭제 API
    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<?> deleteReply(@PathVariable Long replyId, Principal principal) {
        Reply reply = this.replyService.findById(replyId);
        if (!reply.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "삭제 권한이 없습니다.");
        }
        this.replyService.delete(replyId);
        return ResponseEntity.ok("댓글 삭제 성공");
    }

    // 10. 댓글 추천 API
    @PostMapping("/replies/{replyId}/vote")
    public ResponseEntity<?> replyVote(@PathVariable Long replyId, Principal principal) {
        Reply reply = this.replyService.findById(replyId);
        SiteUser siteUser = this.userService.getUser(principal.getName());

        this.replyService.vote(reply, siteUser);
        return ResponseEntity.ok("댓글 추천 완료");
    }

    // 테스트용 데이터 생성기
    @GetMapping("/test/generate")
    public ResponseEntity<?> generateTestData(Principal principal) {
        SiteUser user = this.userService.getUser(principal.getName());
        for (int i = 1; i <= 50; i++) {
            String title = String.format("테스트 게시글 데이터입니다. [%03d]", i);
            String content = "무한 스크롤 테스트를 위한 내용입니다. 🌲";
            this.postService.write(title, content, user);
        }
        return ResponseEntity.ok("테스트 데이터 생성 완료!");
    }
}
