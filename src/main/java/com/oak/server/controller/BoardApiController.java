package com.oak.server.controller;

import com.oak.server.domain.Post;
import com.oak.server.domain.Reply;
import com.oak.server.domain.SiteUser;
import com.oak.server.dto.PostCreateRequest;
import com.oak.server.dto.PostModifyRequest; // ★ 수정용 DTO
import com.oak.server.dto.ReplyRequest;      // ★ 댓글용 DTO
import com.oak.server.service.PostService;
import com.oak.server.service.ReplyService;   // ★ 댓글 서비스
import com.oak.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

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

    // 4. 게시글 수정 API (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<?> modify(@PathVariable Long id,
                                    @RequestBody PostModifyRequest request,
                                    Principal principal) {
        Post post = this.postService.findById(id);

        // 작성자 본인 확인
        if (!post.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정 권한이 없습니다.");
        }

        this.postService.modify(post, request.getTitle(), request.getContent());
        return ResponseEntity.ok("글 수정 성공");
    }

    // 5. 게시글 삭제 API (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {
        Post post = this.postService.findById(id);

        // 작성자 본인 확인
        if (!post.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "삭제 권한이 없습니다.");
        }

        this.postService.delete(post);
        return ResponseEntity.ok("글 삭제 성공");
    }

    // 6. 게시글 추천 API
    @PostMapping("/{id}/vote")
    public ResponseEntity<?> postVote(@PathVariable Long id, Principal principal) {
        Post post = this.postService.findById(id);
        SiteUser siteUser = this.userService.getUser(principal.getName());

        this.postService.vote(post, siteUser);
        return ResponseEntity.ok("추천 완료");
    }

    // 7. 댓글 작성 API
    @PostMapping("/{id}/replies")
    public ResponseEntity<?> createReply(@PathVariable Long id,
                                         @RequestBody ReplyRequest request,
                                         Principal principal) {
        SiteUser siteUser = this.userService.getUser(principal.getName());
        // ReplyService의 메서드 이름이 write인지 create인지 확인 필요 (여기선 write로 가정)
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
}
