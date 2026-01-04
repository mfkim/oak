package com.oak.server.controller;

import com.oak.server.domain.Post;
import com.oak.server.service.PostService;
import com.oak.server.domain.Reply;
import com.oak.server.service.ReplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller // ★ 화면 반환 컨트롤러
@RequiredArgsConstructor
public class BoardController {

    private final PostService postService;
    private final ReplyService replyService;

    @GetMapping("/")
    public String home(Model model, @RequestParam(value="page", defaultValue="0") int page) {
        Page<Post> paging = postService.getList(page);

        model.addAttribute("paging", paging);

        return "post/list";
    }

    @GetMapping("/post/{id}")
    public String detail(@PathVariable Long id, Model model) {
        Post post = postService.findById(id);
        model.addAttribute("post", post);

        List<Reply> replies = replyService.findAll(id);
        model.addAttribute("replies", replies);

        return "post/detail";
    }

    // 1. 글쓰기 화면 (GET)
    @GetMapping("/post/write")
    public String writeForm() {
        return "post/write";
    }

    // 2. 작성된 글 저장 (POST)
    @PostMapping("/post/write")
    public String write(String title, String content, String author) {
        postService.write(title, content, author);

        return "redirect:/";
    }

    // 3. 수정 화면 (GET)
    @GetMapping("/post/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        Post post = postService.findById(id);
        model.addAttribute("post", post);
        return "post/edit";
    }

    // 4. 수정 요청 (POST)
    @PostMapping("/post/edit/{id}")
    public String edit(@PathVariable Long id, String title, String content, String author) {
        postService.edit(id, title, content, author);
        return "redirect:/post/" + id;
    }

    // 5. 삭제 요청 (POST)
    @PostMapping("/post/delete/{id}")
    public String delete(@PathVariable Long id) {
        postService.delete(id);
        return "redirect:/";
    }

    // 6. 댓글 저장 (POST)
    @PostMapping("/post/{id}/reply")
    public String writeReply(@PathVariable Long id, String content, String author) {
        replyService.write(id, content, author);

        return "redirect:/post/" + id;
    }

    // 7. 댓글 수정 화면 (GET)
    @GetMapping("/reply/edit/{replyId}")
    public String replyEditForm(@PathVariable Long replyId, Model model) {
        Reply reply = replyService.findById(replyId);
        model.addAttribute("reply", reply);

        return "post/reply_edit";
    }

    // 8. 댓글 수정 요청 (POST)
    @PostMapping("/reply/edit/{replyId}")
    public String editReply(@PathVariable Long replyId, String content) {
        replyService.edit(replyId, content);
        Reply reply = replyService.findById(replyId);
        Long postId = reply.getPost().getId();

        return "redirect:/post/" + postId;
    }

    // 9. 댓글 삭제 (POST)
    @PostMapping("/post/{postId}/reply/delete/{replyId}")
    public String deleteReply(@PathVariable Long postId, @PathVariable Long replyId) {
        replyService.delete(replyId);
        return "redirect:/post/" + postId;
    }
}
