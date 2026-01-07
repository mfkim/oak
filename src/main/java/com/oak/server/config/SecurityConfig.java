package com.oak.server.config;

import com.oak.server.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정 (리액트와 통신)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 비활성화 (세션)
                .csrf(csrf -> csrf.disable())

                // 3. 세션 사용 안 함
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Form 로그인, HttpBasic 로그인 비활성화
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable())

                // 5. URL별 권한 관리
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/posts", "/api/posts/**").permitAll() // 게시글 조회는 누구나
                        .requestMatchers("/api/auth/**").permitAll() // 로그인, 회원가입은 누구나
                        .anyRequest().authenticated()) // 나머지는 로그인해야 가능

                // 6. JWT 필터를 먼저 실행하도록 설정
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 리액트(5173)가 스프링(8080)에 접근할 수 있게 허용
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
