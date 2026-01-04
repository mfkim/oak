package com.oak.server.service;

import com.oak.server.domain.Post;
import com.oak.server.domain.SiteUser;
import com.oak.server.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class PostService {

    private final PostRepository postRepository;

    // ① 글 쓰기 (Create)
    @Transactional
    public void write(String title, String content, SiteUser author) {
        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setCreateDate(LocalDateTime.now());
        post.setAuthor(author); // 작성자(객체) 저장
        this.postRepository.save(post);
    }

    // ② 전체 글 조회 (Read)
    @Transactional(readOnly = true)
    public Page<Post> getList(int page) {
        List<Sort.Order> sorts = new ArrayList<>();
        sorts.add(Sort.Order.desc("id"));

        Pageable pageable = PageRequest.of(page, 10, Sort.by(sorts));
        return postRepository.findAll(pageable);
    }

    // ②-2. 전체 글 조회 (Read) - List (API)
    @Transactional(readOnly = true)
    public List<Post> findAll() {
        return postRepository.findAll();
    }

    // ③ 특정 글 1개 조회 (Read Detail)
    @Transactional(readOnly = true)
    public Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 글입니다."));
    }

    // ④ 글 수정 (Update)
    @Transactional
    public void edit(Long id, String title, String content) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 글입니다."));

        post.setTitle(title);
        post.setContent(content);
    }

    // ⑤ 글 삭제 (Delete)
    @Transactional
    public void delete(Long id) {
        postRepository.deleteById(id);
    }
}
