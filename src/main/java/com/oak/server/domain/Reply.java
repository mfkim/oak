package com.oak.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Reply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createDate;

    @ManyToOne
    @JsonIgnore
    private Post post;

    @ManyToOne
    private SiteUser author;

    // 수정
    public void update(String content) {
        this.content = content;
    }

    // 추천
    @ManyToMany
    Set<SiteUser> voter;
}
