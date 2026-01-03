package com.oak.server.controller;

import com.oak.server.domain.Post;
import com.oak.server.service.PostService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // ① 글 쓰기 (POST /api/posts)
    @PostMapping
    public String write(@RequestBody PostForm form) {
        // @RequestBody: "JSON으로 보낸 데이터를 이 폼으로 담아주세요"
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
    public String edit(@PathVariable Long id, @RequestBody PostForm form) {
        postService.edit(id, form.getTitle(), form.getContent(), form.getAuthor());
        return "✅ 게시글 수정 성공!";
    }

    // ⑤ 삭제 (DELETE /api/posts/1)
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        postService.delete(id);
        return "🗑️ 게시글 삭제 성공!";
    }

    // [내부 클래스] 데이터를 받을 때 쓸 임시 폼 (DTO 역할)
    @Data
    static class PostForm {
        private String title;
        private String content;
        private String author;
    }
}
