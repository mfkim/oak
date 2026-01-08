package com.oak.server.jwt;

import com.oak.server.service.UserSecurityService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserSecurityService userSecurityService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 요청 헤더에서 토큰 꺼내기
        String token = resolveToken(request);

        // ★ CCTV: 토큰이 잘 들어왔는지 로그 찍기
        System.out.println("================================================");
        System.out.println("1. 요청 URL: " + request.getRequestURI());
        System.out.println("2. 헤더에서 추출한 토큰: " + token);

        // 2. 토큰이 있고, 유효하다면?
        if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
            System.out.println("3. 토큰 유효성 검사 통과! ✅");

            // 3. 토큰에서 사용자 이름(ID) 뽑기
            String username = tokenProvider.getUsername(token);
            System.out.println("4. 토큰 속 사용자 이름: " + username);

            // 4. DB에서 사용자 정보 가져오기
            UserDetails userDetails = userSecurityService.loadUserByUsername(username);

            // 5. 인증 객체 생성
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 6. SecurityContext에 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("5. 인증 완료! SecurityContext에 저장됨.");
        } else {
            System.out.println("3. 토큰이 없거나 유효하지 않음! ❌ (403 원인)");
        }
        System.out.println("================================================");

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
