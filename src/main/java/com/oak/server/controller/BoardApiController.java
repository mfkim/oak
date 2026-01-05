package com.oak.server.controller;

import com.oak.server.domain.Post;
import com.oak.server.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController // ★ 반환값이 HTML 파일명이 아니라 JSON 데이터
@RequestMapping("/api/posts")
public class BoardApiController {

    private final PostService postService;

    // 게시글 목록 조회 API
    @GetMapping("")
    public Page<Post> list(@RequestParam(value = "page", defaultValue = "0") int page,
                           @RequestParam(value = "kw", defaultValue = "") String kw) {

        Page<Post> paging = this.postService.getList(page, kw);

        // 기존 Controller: model.addAttribute("paging", paging); return "post/list";
        // API Controller: 객체(paging)를 그대로 반환하면 자동으로 JSON으로 변환
        return paging;
    }

    // 게시글 상세 조회 API
    @GetMapping("/{id}")
    public Post getPost(@PathVariable Long id) {
        Post post = this.postService.findById(id);

        this.postService.increaseView(post);

        return post;
    }
}
