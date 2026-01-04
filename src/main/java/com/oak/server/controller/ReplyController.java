package com.oak.server.controller;

import com.oak.server.domain.Reply;
import com.oak.server.service.ReplyService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class ReplyController {

    private final ReplyService replyService;

    // ① 댓글 작성 (POST /api/posts/{postId}/replies)
    @PostMapping("/{postId}/replies")
    public String write(@PathVariable Long postId, @RequestBody ReplyForm form) {
        replyService.write(postId, form.getContent(), form.getAuthor());
        return "✅ 댓글 등록 성공!";
    }

    // ② 댓글 조회 (GET /api/posts/{postId}/replies)
    // 해당 게시글에 달린 댓글만 조회
    @GetMapping("/{postId}/replies")
    public List<Reply> findAll(@PathVariable Long postId) {
        return replyService.findAll(postId);
    }

    // ③ 댓글 수정 (PUT /api/posts/{postId}/replies/{replyId})
    // 주소 규칙을 맞추기 위해 postId도 받지만, 실제로는 replyId로 찾습니다.
    @PutMapping("/{postId}/replies/{replyId}")
    public String edit(@PathVariable Long replyId, @RequestBody ReplyForm form) {
        replyService.edit(replyId, form.getContent());
        return "✅ 댓글 수정 성공!";
    }

    // ④ 댓글 삭제 (DELETE /api/posts/{postId}/replies/{replyId})
    @DeleteMapping("/{postId}/replies/{replyId}")
    public String delete(@PathVariable Long replyId) {
        replyService.delete(replyId);
        return "🗑️ 댓글 삭제 성공!";
    }

    // DTO
    @Data
    static class ReplyForm {
        private String content;
        private String author;
    }
}
