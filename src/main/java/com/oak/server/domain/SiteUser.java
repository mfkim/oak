package com.oak.server.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class SiteUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true) // 아이디 중복 금지
    private String username;

    private String password;

    @Column(unique = true) // 이메일 중복 금지
    private String email;
}
