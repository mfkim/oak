package com.oak.server.repository;

import com.oak.server.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("select distinct p from Post p " +
            "left outer join SiteUser u on p.author=u " +
            "where p.title like %:kw% " +
            "or p.content like %:kw% " +
            "or u.username like %:kw%")
    Page<Post> findAllByKeyword(@Param("kw") String kw, Pageable pageable);
}
