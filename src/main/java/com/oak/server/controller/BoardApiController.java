package com.oak.server.controller;

import com.oak.server.domain.Post;
import com.oak.server.domain.SiteUser; // ★ SiteUser 임포트 확인 (패키지명이 다를 수 있음)
import com.oak.server.dto.PostCreateRequest; // ★ 방금 만든 DTO 임포트
import com.oak.server.service.PostService;
import com.oak.server.service.UserService; // ★ UserService 임포트
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.security.Principal; // ★ 로그인 정보 가져오기용

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/posts")
public class BoardApiController {

    private final PostService postService;
    private final UserService userService;

    // 게시글 목록 조회 API
    @GetMapping("")
    public Page<Post> list(@RequestParam(value = "page", defaultValue = "0") int page,
                           @RequestParam(value = "kw", defaultValue = "") String kw) {
        Page<Post> paging = this.postService.getList(page, kw);
        return paging;
    }

    // 게시글 상세 조회 API
    @GetMapping("/{id}")
    public Post getPost(@PathVariable Long id) {
        Post post = this.postService.findById(id);
        this.postService.increaseView(post);
        return post;
    }

    // 게시글 등록 API
    @PostMapping("")
    public void create(@RequestBody PostCreateRequest request, Principal principal) {
        SiteUser author = this.userService.getUser(principal.getName());

        this.postService.write(request.getTitle(), request.getContent(), author);
    }
}
