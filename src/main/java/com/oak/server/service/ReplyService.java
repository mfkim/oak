package com.oak.server.service;

import com.oak.server.domain.Post;
import com.oak.server.domain.Reply;
import com.oak.server.repository.PostRepository;
import com.oak.server.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReplyService {

    private final ReplyRepository replyRepository;
    private final PostRepository postRepository;

    // ① 댓글 쓰기
    @Transactional
    public void write(Long postId, String content, String author) {
        // 1. 게시글 유무 확인
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

        // 2. 댓글 생성
        Reply reply = new Reply(content, author, post);

        // 3. 저장
        replyRepository.save(reply);
    }

    // ② 댓글 목록 조회 (특정 게시글 댓글)
    @Transactional(readOnly = true)
    public List<Reply> findAll(Long postId) {
        return replyRepository.findAllByPostId(postId);
    }

    // ③ 댓글 수정
    @Transactional
    public void edit(Long replyId, String content) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));

        // Dirty Checking으로 자동 저장
        reply.update(content);
    }

    // ④ 댓글 삭제
    @Transactional
    public void delete(Long replyId) {
        replyRepository.deleteById(replyId);
    }

    // ⑤ 댓글 단건 조회 (수정 화면용)
    @Transactional(readOnly = true)
    public Reply findById(Long replyId) {
        return replyRepository.findById(replyId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));
    }
}
