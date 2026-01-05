package com.oak.server.controller;

import com.oak.server.domain.Post;
import com.oak.server.domain.Reply;
import com.oak.server.domain.SiteUser;
import com.oak.server.service.PostService;
import com.oak.server.service.ReplyService;
import com.oak.server.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RequiredArgsConstructor
@Controller
public class BoardController {

    private final PostService postService;
    private final UserService userService;
    private final ReplyService replyService;

    // ==========================================
    //  게시글 (POST) 관련 기능
    // ==========================================

    /**
     * 메인 홈 - 게시글 목록 조회 (검색 + 페이징)
     */
    @GetMapping("/")
    public String home(Model model,
                       @RequestParam(value = "page", defaultValue = "0") int page,
                       @RequestParam(value = "kw", defaultValue = "") String kw) {

        Page<Post> paging = postService.getList(page, kw);
        model.addAttribute("paging", paging);
        model.addAttribute("kw", kw);

        return "post/list";
    }

    /**
     * 게시글 상세 조회
     */
    @GetMapping("/post/{id}")
    public String detail(@PathVariable Long id, Model model) {
        Post post = postService.findById(id);

        // 조회수 증가
        postService.increaseView(post);

        model.addAttribute("post", post);

        // 댓글 목록 (엔티티 연관관계로 가져올 수도 있지만 명시적으로 서비스 호출)
        List<Reply> replies = replyService.findAll(id);
        model.addAttribute("replies", replies);

        return "post/detail";
    }

    /**
     * 게시글 작성 화면 (GET)
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/post/write")
    public String writeForm(PostForm postForm, Model model) {
        model.addAttribute("targetUrl", "/post/write");
        return "post/write";
    }

    /**
     * 게시글 작성 처리 (POST) - 파일 업로드 포함
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/post/write")
    public String write(@Valid PostForm postForm, BindingResult bindingResult,
                        Principal principal,
                        @RequestParam("thumbnail") MultipartFile thumbnail,
                        Model model) throws IOException {

        if (bindingResult.hasErrors()) {
            model.addAttribute("targetUrl", "/post/write");
            return "post/write";
        }

        SiteUser siteUser = this.userService.getUser(principal.getName());
        this.postService.create(postForm.getTitle(), postForm.getContent(), siteUser, thumbnail);

        return "redirect:/";
    }

    /**
     * 게시글 수정 화면 (GET)
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/post/edit/{id}")
    public String editForm(@PathVariable Long id, PostForm postForm, Principal principal, Model model) {
        Post post = postService.findById(id);

        if (!post.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정 권한이 없습니다.");
        }

        postForm.setTitle(post.getTitle());
        postForm.setContent(post.getContent());

        // 수정이니까 목적지는 /post/edit/{id}
        model.addAttribute("targetUrl", "/post/edit/" + id);

        return "post/write"; // write.html을 재사용!
    }

    /**
     * 게시글 수정 처리 (POST)
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/post/edit/{id}")
    public String edit(@PathVariable Long id, @Valid PostForm postForm, BindingResult bindingResult,
                       Principal principal, Model model) {

        if (bindingResult.hasErrors()) {
            model.addAttribute("targetUrl", "/post/edit/" + id);

            return "post/write";
        }

        Post post = postService.findById(id);

        if (!post.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정 권한이 없습니다.");
        }

        postService.edit(id, postForm.getTitle(), postForm.getContent());
        return "redirect:/post/" + id;
    }

    /**
     * 게시글 삭제 처리 (POST)
     */
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

    /**
     * 게시글 추천 (GET)
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/post/vote/{id}")
    public String postVote(Principal principal, @PathVariable("id") Long id) {
        Post post = this.postService.findById(id);
        SiteUser siteUser = this.userService.getUser(principal.getName());

        this.postService.vote(post, siteUser);

        return "redirect:/post/" + id;
    }


    // ==========================================
    //  댓글 (REPLY) 관련 기능
    // ==========================================

    /**
     * 댓글 작성 (POST)
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/post/{id}/reply")
    public String writeReply(@PathVariable Long id, @RequestParam String content, Principal principal) {
        // 내용이 비어있을 경우에 대한 간단한 방어 로직 추가 추천 (프론트에서도 막겠지만)
        if (content == null || content.trim().isEmpty()) {
            // 에러 처리 혹은 그냥 리다이렉트
            return "redirect:/post/" + id;
        }

        SiteUser siteUser = this.userService.getUser(principal.getName());
        replyService.write(id, content, siteUser);

        return "redirect:/post/" + id;
    }

    /**
     * 댓글 수정 화면 (GET)
     */
    @GetMapping("/reply/edit/{replyId}")
    public String replyEditForm(@PathVariable Long replyId, Model model) {
        Reply reply = replyService.findById(replyId);
        model.addAttribute("reply", reply);
        return "post/reply_edit";
    }

    /**
     * 댓글 수정 처리 (POST)
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/reply/edit/{replyId}")
    public String editReply(@PathVariable Long replyId, @RequestParam String content, Principal principal) {
        Reply reply = replyService.findById(replyId);

        if (!reply.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정 권한이 없습니다.");
        }

        replyService.edit(replyId, content);
        return "redirect:/post/" + reply.getPost().getId(); // 댓글이 달린 게시글로 복귀
    }

    /**
     * 댓글 삭제 처리 (POST)
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/post/{postId}/reply/delete/{replyId}")
    public String deleteReply(@PathVariable Long postId, @PathVariable Long replyId, Principal principal) {
        Reply reply = replyService.findById(replyId);

        if (!reply.getAuthor().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "삭제 권한이 없습니다.");
        }

        replyService.delete(replyId);
        return "redirect:/post/" + postId;
    }

    /**
     * 댓글 추천 (GET)
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/reply/vote/{id}")
    public String replyVote(Principal principal, @PathVariable("id") Long id) {
        Reply reply = this.replyService.findById(id);
        SiteUser siteUser = this.userService.getUser(principal.getName());

        this.replyService.vote(reply, siteUser);

        // 앵커(#reply_ID)를 사용하여 추천 후 해당 댓글 위치로 스크롤 이동
        return String.format("redirect:/post/%s#reply_%s",
                reply.getPost().getId(), reply.getId());
    }
}
