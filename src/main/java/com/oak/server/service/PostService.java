package com.oak.server.service;

import com.oak.server.domain.Post;
import com.oak.server.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor // Repository 자동 연결
public class PostService {

    private final PostRepository postRepository;

    // ① 글 쓰기 (Create)
    @Transactional // 저장하다가 에러 나면 롤백(취소)!
    public void write(String title, String content, String author) {
        Post post = new Post(title, content, author);
        postRepository.save(post);
    }

    // ② 전체 글 조회 (Read)
    // 읽기 전용 모드
    @Transactional(readOnly = true)
    public Page<Post> getList(int page) {
        // 1. 최신순으로 정렬 (id 내림차순)
        List<Sort.Order> sorts = new ArrayList<>();
        sorts.add(Sort.Order.desc("id"));

        // 2. 페이지 요청
        Pageable pageable = PageRequest.of(page, 10, Sort.by(sorts));

        // 3. 페이징된 데이터 반환
        return postRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<Post> findAll() {
        return postRepository.findAll();
    }

    // ③ 특정 글 1개 조회 (Read Detail)
    @Transactional(readOnly = true)
    public Post findById(Long id) {
        // 없으면 에러
        return postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 글입니다."));
    }

    // ④ 글 수정 (Update)
    @Transactional
    public void edit(Long id, String title, String content, String author) {
        // 1. DB에서 글을 찾아온다.
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 글입니다."));

        // 2. 내용을 바꾼다. (Entity에 만들어둔 update 메서드 사용)
        // ★ save 호출 필요없음
        // @Transactional이 끝날 때 변경된 걸 감지하고 알아서 DB 업데이트 (Dirty Checking)
        post.update(title, content, author);
    }

    // ⑤ 글 삭제 (Delete)
    @Transactional
    public void delete(Long id) {
        postRepository.deleteById(id);
    }
}
