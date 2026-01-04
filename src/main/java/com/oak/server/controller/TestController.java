package com.oak.server.controller;

import com.oak.server.domain.SiteUser;
import com.oak.server.service.PostService;
import com.oak.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequiredArgsConstructor
public class TestController {

    private final PostService postService;
    private final UserService userService;

    @GetMapping("/test/data")
    @ResponseBody
    public String addTestData() {
        // 1. 테스트 데이터를 작성할 '회원 객체'
        SiteUser author;
        try {
            author = userService.getUser("testuser");
        } catch (Exception e) {
            author = userService.create("testuser", "test@test.com", "1234");
        }

        // 2. 글 생성 (작성자 객체 author를 같이 넘겨줍니다)
        for (int i = 1; i <= 120; i++) {
            String subject = String.format("테스트 데이터입니다. [%03d]", i);
            String content = "테스트";

            postService.write(subject, content, author);
        }

        return "데이터 120개 생성 완료! (작성자: testuser)";
    }
}
