package com.oak.server.service;

import com.oak.server.domain.Post;
import com.oak.server.domain.Reply;
import com.oak.server.domain.SiteUser;
import com.oak.server.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ReplyService {

    private final ReplyRepository replyRepository;
    private final PostService postService; // 게시글 존재 확인

    // 1. 댓글 쓰기
    @Transactional
    public void write(Long postId, String content, SiteUser author) {
        Post post = postService.findById(postId);

        Reply reply = new Reply();
        reply.setContent(content);
        reply.setCreateDate(java.time.LocalDateTime.now());
        reply.setPost(post);
        reply.setAuthor(author);

        this.replyRepository.save(reply);
    }

    // 2. 댓글 조회
    @Transactional(readOnly = true)
    public Reply findById(Long id) {
        return replyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));
    }

    // 3. 댓글 수정
    @Transactional
    public void edit(Long id, String content) {
        Reply reply = findById(id);
        reply.update(content);
    }

    // 4. 댓글 삭제
    @Transactional
    public void delete(Long id) {
        replyRepository.deleteById(id);
    }

    // 5. 특정 게시글의 댓글 목록
    @Transactional(readOnly = true)
    public List<Reply> findAll(Long postId) {
        Post post = postService.findById(postId);
        return post.getReplyList();
    }

    // 6. 댓글 추천 기능 (토글)
    public void vote(Reply reply, SiteUser siteUser) {
        if (reply.getVoter().contains(siteUser)) {
            reply.getVoter().remove(siteUser); // 취소
        } else {
            reply.getVoter().add(siteUser); // 추천
        }
        this.replyRepository.save(reply);
    }
}
