package com.oak.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 주소창에 /files/로 시작하는 요청이 들어오면
        // 프로젝트 내부의 src/main/resources/static/files/ 폴더에서 파일을 찾아
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:src/main/resources/static/files/");
    }
}
