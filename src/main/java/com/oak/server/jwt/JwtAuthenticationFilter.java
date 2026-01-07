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

        // 2. 토큰이 있고, 유효하면?
        if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
            // 3. 토큰에서 username 얻기
            String username = tokenProvider.getUsername(token);

            // 4. DB에서 사용자 정보 가져오기 (존재, 권한 확인)
            UserDetails userDetails = userSecurityService.loadUserByUsername(username);

            // 5. 인증 완료 (Authentication 객체 생성)
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 6. SecurityContext에 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 7. 다음 필터로 넘기기
        filterChain.doFilter(request, response);
    }

    // 헤더에서 "Bearer " 떼고 토큰만 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
