package com.oak.server.controller;

import com.oak.server.domain.Post;
import com.oak.server.service.PostService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // ① 글 쓰기 (POST /api/posts)
    @PostMapping
    public String write(@RequestBody @Valid PostForm form) {
        postService.write(form.getTitle(), form.getContent(), form.getAuthor());
        return "✅ 게시글 저장 성공!";
    }

    // ② 전체 조회 (GET /api/posts)
    @GetMapping
    public List<Post> findAll() {
        return postService.findAll();
    }

    // ③ 상세 조회 (GET /api/posts/1)
    @GetMapping("/{id}")
    public Post findById(@PathVariable Long id) {
        return postService.findById(id);
    }

    // ④ 수정 (PUT /api/posts/1)
    @PutMapping("/{id}")
    public String edit(@PathVariable Long id, @RequestBody @Valid PostForm form) {
        postService.edit(id, form.getTitle(), form.getContent(), form.getAuthor());
        return "✅ 게시글 수정 성공!";
    }

    // ⑤ 삭제 (DELETE /api/posts/1)
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        postService.delete(id);
        return "🗑️ 게시글 삭제 성공!";
    }

    // DTO
    @Data
    static class PostForm {

        @NotBlank(message = "제목은 필수입니다.") // 빈칸, 공백 금지
        @Size(max = 20, message = "제목은 20자 이내로 입력해주세요.")
        private String title;

        @NotBlank(message = "내용은 필수입니다.")
        private String content;

        private String author; // (로그인 기능 생기면 자동화)
    }
}
