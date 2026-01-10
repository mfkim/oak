package com.oak.server.repository;

import com.oak.server.domain.Reply;
import com.oak.server.domain.SiteUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReplyRepository extends JpaRepository<Reply, Long> {

    // PostId 일치하는 모든 댓글
    List<Reply> findAllByPostId(Long postId);

    // 내가 쓴 댓글 찾기
    List<Reply> findByAuthor(SiteUser author);
}
