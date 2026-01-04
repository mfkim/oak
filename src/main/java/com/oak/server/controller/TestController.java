package com.oak.server.controller;

import com.oak.server.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequiredArgsConstructor
public class TestController {

    private final PostService postService;

    @GetMapping("/test/data")
    @ResponseBody
    public String addTestData() {
        for (int i = 1; i <= 120; i++) {
            postService.write("테스트 데이터입니다. [" + i + "]", "내용 없음", "테스터");
        }
        return "데이터 120개 생성 완료!";
    }
}
