package com.oak.server.repository;

import com.oak.server.domain.Post;
import com.oak.server.domain.SiteUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("select distinct p from Post p " +
            "left outer join SiteUser u on p.author=u " +
            "where p.title like %:kw% " +
            "or p.content like %:kw% " +
            "or u.username like %:kw%")
    Page<Post> findAllByKeyword(@Param("kw") String kw, Pageable pageable);

    // 내가 쓴 글 찾기
    List<Post> findByAuthor(SiteUser author);

    // 내가 좋아요 누른 글 찾기
    List<Post> findByVoterContains(SiteUser voter);
}
