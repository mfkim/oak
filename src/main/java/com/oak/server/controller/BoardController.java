package com.oak.server.controller;

import com.oak.server.domain.Post;
import com.oak.server.domain.Reply;
import com.oak.server.domain.SiteUser;
import com.oak.server.service.PostService;
import com.oak.server.service.ReplyService;
import com.oak.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;
import com.oak.server.controller.PostForm;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RequiredArgsConstructor
@Controller
public class BoardController {

    private final PostService postService;
    private final UserService userService;
    private final ReplyService replyService;

    // Home
    @GetMapping("/")
    public String home(Model model,
                       @RequestParam(value = "page", defaultValue = "0") int page,
                       @RequestParam(value = "kw", defaultValue = "") String kw) {

        Page<Post> paging = postService.getList(page, kw);

        model.addAttribute("paging", paging);
        model.addAttribute("kw", kw);

        return "post/list";
    }

    // 상세 페이지
    @GetMapping("/post/{id}")
    public String detail(@PathVariable Long id, Model model) {
        Post post = postService.findById(id);
        model.addAttribute("post", post);

        postService.increaseView(post);
        model.addAttribute("post", post);

        List<Reply> replies = replyService.findAll(id);
        model.addAttribute("replies", replies);

        return "post/detail";
    }

    // 1. 글쓰기 화면 (GET)
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/post/write")
    public String writeForm(PostForm postForm) {
        return "post/write";
    }

    // 2. 작성된 글 저장 (POST)
//    @PreAuthorize("isAuthenticated()")
//    @PostMapping("/post/write")
//    public String write(@Valid PostForm postForm, BindingResult bindingResult, Principal principal) {
//        if (bindingResult.hasErrors()) {
//            return "post/write";
//        }
//
//        SiteUser siteUser = this.userService.getUser(principal.getName());
//        this.postService.write(postForm.getTitle(), postForm.getContent(), siteUser);
//
//        return "redirect:/";
//    }

    // 3. 수정 화면 (GET)
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/post/edit/{id}")
    public String editForm(@PathVariable Long id, Model model, Principal principal) {
        Post post = postService.findById(id);

        if (!post.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정 권한이 없습니다.");
        }

        model.addAttribute("post", post);
        return "post/edit";
    }

    // 4. 수정 요청 (POST)
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/post/edit/{id}")
    public String edit(@PathVariable Long id, String title, String content, Principal principal) {
        Post post = postService.findById(id);

        if (!post.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정 권한이 없습니다.");
        }

        postService.edit(id, title, content);
        return "redirect:/post/" + id;
    }

    // 5. 삭제 요청 (POST)
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/post/delete/{id}")
    public String delete(@PathVariable Long id, Principal principal) {
        Post post = postService.findById(id);

        if (!post.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "삭제 권한이 없습니다.");
        }

        postService.delete(id);
        return "redirect:/";
    }

    // 6. 댓글 저장 (POST)
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/post/{id}/reply")
    public String writeReply(@PathVariable Long id, String content, Principal principal) {
        // 1. 로그인한 회원 정보 가져오기
        SiteUser siteUser = this.userService.getUser(principal.getName());

        // 2. 댓글 저장 (게시글ID, 내용, 작성자객체)
        replyService.write(id, content, siteUser);

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
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/reply/edit/{replyId}")
    public String editReply(@PathVariable Long replyId, String content, Principal principal) {
        Reply reply = replyService.findById(replyId);

        // ★ 보안 검사: 내 댓글이 아니면 에러 발생
        if (!reply.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정 권한이 없습니다.");
        }

        replyService.edit(replyId, content);

        // 댓글이 달린 게시글 페이지로 돌아감
        return "redirect:/post/" + reply.getPost().getId();
    }

    // 9. 댓글 삭제 (POST)
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/post/{postId}/reply/delete/{replyId}")
    public String deleteReply(@PathVariable Long postId, @PathVariable Long replyId, Principal principal) {
        Reply reply = replyService.findById(replyId);

        // ★ 보안 검사: 내 댓글이 아니면 에러 발생
        if (!reply.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "삭제 권한이 없습니다.");
        }

        replyService.delete(replyId);
        return "redirect:/post/" + postId;
    }

    // 10. 게시글 추천 (GET)
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/post/vote/{id}")
    public String postVote(Principal principal, @PathVariable("id") Long id) {
        Post post = this.postService.findById(id);
        SiteUser siteUser = this.userService.getUser(principal.getName());

        this.postService.vote(post, siteUser);

        return "redirect:/post/" + id;
    }

    // 11. 댓글 추천 (GET)
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/reply/vote/{id}")
    public String replyVote(Principal principal, @PathVariable("id") Long id) {
        Reply reply = this.replyService.findById(id);
        SiteUser siteUser = this.userService.getUser(principal.getName());

        this.replyService.vote(reply, siteUser);

        return String.format("redirect:/post/%s#reply_%s",
                reply.getPost().getId(), reply.getId());
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/post/write")
    public String postWrite(@Valid PostForm postForm, BindingResult bindingResult,
                            Principal principal,
                            @RequestParam("thumbnail") MultipartFile thumbnail) throws IOException {

        if (bindingResult.hasErrors()) {
            return "post/post_form";
        }

        SiteUser siteUser = this.userService.getUser(principal.getName());

        // 서비스 호출 시 thumbnail 파일도 함께 넘겨줍니다.
        this.postService.create(postForm.getTitle(), postForm.getContent(), siteUser, thumbnail);

        return "redirect:/";
    }
}
