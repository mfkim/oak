package com.oak.server.repository;

import com.oak.server.domain.Reply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReplyRepository extends JpaRepository<Reply, Long> {

    // PostId 일치하는 모든 댓글 찾아서 리스트로
    List<Reply> findAllByPostId(Long postId);
}
