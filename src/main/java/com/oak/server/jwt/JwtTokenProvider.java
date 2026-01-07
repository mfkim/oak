package com.oak.server.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long validityInMilliseconds = 3600000; // 1시간

    public JwtTokenProvider(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // 1. 토큰 생성 (로그인 성공 시 호출)
    public String createToken(String username) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .subject(username) // 사용자 이름
                .issuedAt(now)     // 생성 시간
                .expiration(validity) // 만료 시간
                .signWith(secretKey) // 비밀키 서명
                .compact();
    }

    // 2. 토큰에서 사용자 이름 꺼내기 (요청 들어올 때 호출)
    public String getUsername(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // 3. 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            // 위조되었거나 만료된 토큰
            return false;
        }
    }
}
