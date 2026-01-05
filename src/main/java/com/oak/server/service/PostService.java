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

    // 1. 글 쓰기 (Create)
    @Transactional
    public void write(String title, String content, SiteUser author) {
        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setCreateDate(LocalDateTime.now());
        post.setAuthor(author);
        this.postRepository.save(post);
    }

    // 2. 글 조회 (Read)
    @Transactional(readOnly = true)
    public Page<Post> getList(int page, String kw) {
        List<Sort.Order> sorts = new ArrayList<>();
        sorts.add(Sort.Order.desc("createDate"));
        Pageable pageable = PageRequest.of(page, 10, Sort.by(sorts));

        return this.postRepository.findAllByKeyword(kw, pageable);
    }

    // 2-1. 글 조회 (Read) - API
    @Transactional(readOnly = true)
    public List<Post> findAll() {
        return postRepository.findAll();
    }

    // 3. 특정 글 1개 조회 (Read Detail)
    @Transactional(readOnly = true)
    public Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 글입니다."));
    }

    // 4. 글 수정 (Update)
    @Transactional
    public void edit(Long id, String title, String content) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 글입니다."));

        post.setTitle(title);
        post.setContent(content);
    }

    // 5. 글 삭제 (Delete)
    @Transactional
    public void delete(Long id) {
        postRepository.deleteById(id);
    }

    // 6. 글 추천
    public void vote(Post post, SiteUser siteUser) {
        if (post.getVoter().contains(siteUser)) {
            // 1. 이미 추천한 사람이라면 -> 추천 취소 (삭제)
            post.getVoter().remove(siteUser);
        } else {
            // 2. 추천하지 않은 사람이라면 -> 추천 (추가)
            post.getVoter().add(siteUser);
        }
        this.postRepository.save(post);
    }

    // 조회수 카운트
    @Transactional
    public void increaseView(Post post) {
        post.setView(post.getView() + 1);
        this.postRepository.save(post);
    }
}
