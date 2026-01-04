package com.oak.server.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Reply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content; // 댓글 내용

    private String author; // 작성자

    // ★ 연관관계 매핑 (N:1)
    // 여러 개의 댓글(Many) -> 하나의 게시글(One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    // 생성자
    public Reply(String content, String author, Post post) {
        this.content = content;
        this.author = author;
        this.post = post;
    }

    // 댓글 수정
    public void update(String content) {
        this.content = content;
    }
}
