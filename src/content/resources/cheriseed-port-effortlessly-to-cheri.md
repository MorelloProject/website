---
author: arm
title: CHERIseed – port effortlessly to CHERI
date: 2022-12-08 12:00:00
category: resources
description: Enabling users to run CHERI semantics within non-CHERI architecture. A tool to detect capability violations and help users port their codebase to CHERI.
image: ../../assets/images/content/Security_screen.jpg
extra:
  head: |
    <style type="text/css">
      article {
        position: relative;
      }
      #wrapper {
        text-align: justify;
      }
      #wrapper h1 + p,
      #wrapper h3 + p {
        text-indent: 18px;
      }
      #wrapper .highlight pre {
        border-radius: 5px;
        background-color: #262934;
      }
      #wrapper .highlight pre .lineno {
        padding: 0 15px;
        color: #616780;
      }
      #wrapper .highlight pre code {
        color: #f3f5f5;
      }
      #wrapper .highlight pre code .cpf {
        color: #a0a0a0;
      }
      #wrapper .highlight pre code .cp {
        color: #efefef;
      }
      #wrapper .highlight pre code .cm,
      #wrapper .highlight pre code .c1 {
        color: #25a112;
      }
      #wrapper .language-diff .p {
        color: #01b4cc;
      }
      html {
        scroll-padding-top: 150px;
      }
      #sidebar-cheriseed {
        font-size: 14px;
        height: 100%;
        width: 15%;
        top:300px;
        left: 0;
        margin-left: 10px;
        padding-right: 40px;
      }
      #sidebar-cheriseed>li>a {
          color:grey;
          text-align: left;
          border-left: 2px solid transparent;
      }
      #sidebar-cheriseed>.active>a,
      #sidebar-cheriseed>li>a:hover,
      #sidebar-cheriseed>li>a:focus {
          color: black;
          text-decoration: none;
          background-color: #eaeaea;
          border-left: 1px solid #273548;
      }
      #sidebar-cheriseed>.active>a,
      #sidebar-cheriseed>.active:hover>a,
      #sidebar-cheriseed>.active:focus>a {
          background-color: transparent;
          font-weight: 500;
          border-left: 3px solid #273548;
      }
      .sidebar-cheriseed-2>a {
        font-size: 13px;
        padding-left: 35px;
      }
      #exampleModal p {
        padding: 0 10px;
        text-indent: 18px;
      }
      #buildModal p {
        padding: 0 10px;
      }
      @media (max-width: 1000px) {
        #sidebar-cheriseed {
          display: none;
        }
      }
    </style>
    <script type="text/javascript">
      function getAllHeadings(entry){
          var id = entry.target.getAttribute('id');
          return document.querySelector('#sidebar-cheriseed li a[href="#'+id+'"]');
      }
      window.addEventListener('DOMContentLoaded', () => {
        var curr = null;
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (getAllHeadings(entry) != null) {
              var clist = getAllHeadings(entry).parentElement.classList;
              if (entry.intersectionRatio > 0) {
                clist.add('showing-sidebar');
              } else {
                clist.remove('showing-sidebar');
              }
            }
          });
          var showing = document.querySelectorAll('.showing-sidebar');
          if(showing.length > 0) {
            if (curr !== null ) curr.classList.remove('active');
            showing[0].classList.add('active');
            curr = showing[0];
          }
        });

        document.querySelectorAll('h1[id], h3[id]').forEach((section) => {
          observer.observe(section);
        });
        document.querySelectorAll('.highlight pre.highlight figure').forEach((section) => {
          var d = section.querySelector('figure.highlight pre');
          section.outerHTML = d.innerHTML;
        });
        document.querySelectorAll('.remove-copyright pre.highlight code').forEach((section) => {
          var startReading = false;
          var commentStarted = false;
          var formatted_text = '';
          section.innerHTML.split("\n").forEach(line => {
            if (!startReading) {
              if (!commentStarted && line.includes('/*'))
                commentStarted = true;
              if (commentStarted && line.includes('*/'))
                startReading = true;
              if (commentStarted)
                return;
            }
            formatted_text += line + '\n';
          });
          console.log(formatted_text);
          section.innerHTML = formatted_text.replace(/\n$/, '');
        });
      });
    </script>
---

<!-------------------------- MAIN CONTENT ------------------------------------->

# CHERI - Overview

Current CPU architectures require strong software support for memory and address-space management, increasing the overhead and complexity to make systems more secure. Preventing, or even just mitigating, exploitation of software bugs in the systems results in inefficient and increasingly expensive software support.

CHERI-based architecture introduces hardware-supported security features using explicit capability model with bounded memory access and additional properties to limit unauthorized memory exploitations. All memory within an address space in such an architecture can be accessed via one of two kinds of capabilities, with one of the types used in load/store instructions to access data or other capabilities, and the other one - for transition between protection domains via invoking call/return instructions[^ref1] [^ref2]. To find out more about memory protection, check this [post] [morello-page].

# CHERIseed – Introduction

While CHERI introduces strong security features, it also requires tweaking the programming model to ensure capability provenance validity, monotonicity and to resolve other capability related faults. So, migrating your project to enable the use of the CHERI features could be a bit tedious. To overcome this deterrence and to facilitate the porting effort of existing code to CHERI hardware platform we are introducing CHERIseed.

CHERIseed is a software-only implementation of CHERI C/C++ semantics[^ref3]. It provides some CHERI functionality while running your project on a host machine that is not capability aware. This tool helps decrease complexity of porting to CHERI hardware by helping developers learn and identify potentially unsafe code that would fault on real CHERI hardware. CHERI C/C++ is relatively new and CHERIseed helps in step-by-step introduction of CHERI into any code base. CHERIseed provides the following key functionalities:

- An interface to modify and retrieve capability properties using CHERI APIs,
- 128-bit capability representation for a 64-bit address space and
- Tags, bounds and permissions checking on pointer dereferences.

CHERIseed is a semantic implementation of CHERI C/C++ which provides developers that have access to widely used architectures to modify their codebase and add support for CHERI. Hence, CHERIseed does not emulate CHERI hardware, it uses a third-party library to encode/decode capabilities. CHERIseed does not provide similar security guarantees as CHERI hardware and should not be used as a replacement security enforcing tool. This tool includes features to detect CHERI violations like untagged, out-of-bounds access and invalid permission violations, and provides detailed description of these faults for efficient debugging of the ported software - for details, refer [CHERIseed.rst] [cheriseed-rst]. Because of the nature of code instrumentation, CHERIseed does not provide any performance advantage over the real hardware and should not be used for performance benchmarking.

# Bringing CHERIseed to your Project

This section explores the use of CHERIseed by demonstrating how it displays a CHERI violation and how it helps to fix a bug. A simple example, which runs without issues, produces a capability violation when compiled with CHERIseed enabled, revealing a bug. Currently, CHERIseed allows to build and run static and dynamically linked applications on `aarch64` or `x86` machines. See [CHERI C/C++ Programming Guide] [pro-guide], for more details.

### Source – [string.c](source-link)

`https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/raw/491db32a6a29fdc33144a2baeb82850094ee9866/cheriseed/001-blogpost/string/string.c`

### Compiling

Check the <a data-toggle="modal" data-target="#buildModal">musl-libc build</a> to see how to setup the environment to build CHERIseed on your machine.
Compile `string.c` on the host machine using the flags `-fsanitize=cheriseed` to enable CHERIseed and `-cheri-bounds=subobject-safe` to enable enforcements on C-language objects within allocations.

<div
  class="modal fade"
  id="buildModal"
  tabindex="-1"
  aria-labelledby="buildModalLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button
          type="button"
          class="close"
          data-dismiss="modal"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">{{ musl_libc_text }}</div>
      <div class="modal-footer"></div>
    </div>
  </div>
</div>
```sh $> ${CC} \ --target=${TARGET_TRIPLE} \ -rtlib=compiler-rt \ --sysroot="${
  MUSL_PREFIX
}" \ -lc -lpthread -lm -lrt \ -fuse-ld=lld \ -fsanitize=cheriseed \ -mabi=purecap
\ -static \ -cheri-bounds=subobject-safe \ string.c -o string.bin ``` Pure Capability
(`purecap`) is a new ABI which requires pre-ported `libc` support. This mode indicates
that all pointers should automatically be represented as a capability, without the
need for `__capability` annotations. Use the flag `-mabi=purecap` to compile in purecap.

{{ additional_notes }}
{{ note_header }}Design{{ end_note_header }}
CHERIseed is based on LLVM project, and it is composed of LLVM module pass and compiler runtime. The input of the module pass is LLVM IR generated for CHERI, and it replaces IR instruction operating on capabilities. This design decision should enable CHERIseed to run on any given platform. The following is an example of how CHERIseed input IR is modified by CHERIseed:

<p><b><a href="https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/raw/40cc6e0565c4e210102516058f46f824db164752/cheriseed/001-blogpost/snippet_design_source.c">Source</a></b></p>
{{ custom_highlight_remove_cr }}{% highlight c %}{% load_external_file https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/raw/40cc6e0565c4e210102516058f46f824db164752/cheriseed/001-blogpost/snippet_design_source.c %}{% endhighlight %}{{ end_custom_highlight }}

<p>
  <b>
    <a href="https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/raw/40cc6e0565c4e210102516058f46f824db164752/cheriseed/001-blogpost/snippet_design_llvm_ir_1.txt">
      Input IR
    </a>
  </b>
</p>

{{ custom_code }}{% highlight none %}{% load_external_file https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/raw/40cc6e0565c4e210102516058f46f824db164752/cheriseed/001-blogpost/snippet_design_llvm_ir_1.txt %}{% endhighlight %}{{ end_custom_code }}

<p><b><a href="https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/raw/40cc6e0565c4e210102516058f46f824db164752/cheriseed/001-blogpost/snippet_design_llvm_ir_2.txt">Output IR</a></b></p>
{{ custom_code }}{% highlight none %}{% load_external_file https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/raw/40cc6e0565c4e210102516058f46f824db164752/cheriseed/001-blogpost/snippet_design_llvm_ir_2.txt %}{% endhighlight %}{{ end_custom_code }}

The address space of CHERI is 128-bit (on 64-bit host) and CHERIseed abstracts capability with a 16-byte aligned {{ emphasize_me }}\_\_cheriseed_cap_t{{ end_emphasize_me }}. The CHERIseed capabilities are compressed into two 64-bit values. An integer address of the 64 bits (value) and additional 64 bits (metadata) contributing to the protection model such as bounds, permissions, object type. Additionally, there is a 1-bit validity tag to track the validity of a capability. Compiler-rt implements CHERI intrinsic functions along with few CHERIseed APIs. Runtime APIs makes use of {{ emphasize_me }}cheri-compressed-cap{{ end_emphasize_me }} library to compress and decompress metadata of a capability. To learn more about the CHERIseed design refer to <a href="https://git.morello-project.org/morello/llvm-project/-/blob/cheriseed/clang/docs/CHERIseedDesign.rst">CHERIseedDesign.rst</a>.
{{ end_additional_notes }}

### Adapting to CHERI

Now we have successfully compiled the source with CHERIseed. Run the program and use `gdb` to inspect the issue.

{{ custom_code }}(gdb) run
Starting program: /home/cheriseed-workspace/string.bin

================================================================
{{red_c}}Runtime Error detected by CHERIseed{{end_c}}

Capability is untagged at {{green_c}}0x77fff7febb60{{end_c}}:

{{green_c}}0x0000002050db{{end_c}} [{{green_c}}0x000000000000{{end_c}}-{{green_c}}0xffffffffffffffff{{end_c}}] {{cyan_c}}(invalid){{end_c}}

Tag address was at {{green_c}}0x7f7ff77eebb6{{end_c}}

Shadow memory layout:
low [{{green_c}}0x77fff7ff0000{{end_c}}-{{green_c}}0x7f7ff77ef000{{end_c}}]
gap [{{green_c}}0x7f7ff77ef000{{end_c}}-{{green_c}}0x7ffff77ef000{{end_c}}]
high [{{green_c}}0x7ffff77ef000{{end_c}}-{{green_c}}0x7ffff7ff0000{{end_c}}]

# tid: {{green_c}}12868{{end_c}}

Program received signal SIGSEGV, Segmentation fault.
{{blue_c}}0x000000000023309{{end_c}} in {{yellow_c}}morello::shim::svc_impl{{end_c}} () at {{green_c}}src/svc.cpp{{end_c}}:54
54 in {{green_c}}src/svc.cpp{{end_c}}
{{ end_custom_code }}

We have encountered CHERIseed runtime error specifying which CHERI violation is at fault, which line triggered the fault and details regarding the capability responsible in order to provide useful information during the debugging session.

Following is an overview of how we represent a capability string.

{{ custom_code }}{{green_c}}&lt;address&gt;{{end_c}} [{{magenta_c}}&lt;permissions&gt;{{end_c}},{{green_c}}&lt;base&gt;{{end_c}}-{{green_c}}&lt;top&gt;{{end_c}}] {{cyan_c}}(&lt;attr&gt;){{end_c}}
{{ end_custom_code }}

To read more about the capability string representation used, see [Display Capabilities] [cap-display-format]. Interpreting the above error message tells that capability at `0x77fff7febb60` is invalid with the value `0x0000002050db`.

{{ additional_notes }}
{{ note_header }}Note{{ end_note_header }}
{{ custom_code }}(gdb) x/2xg 0x77fff7febb60
{{blue_c}}0x77fff7febb60{{end_c}}: 0x0000002050db 0x000000000000
(gdb) x/s 0x0000002050db
{{blue_c}}0x2050db{{end_c}}: "This is a string"
{{ end_custom_code }}
The address used by the function is not the address of the pointer but of the capability where the address of the pointer is stored. This additional level of indirection should be kept in mind while debugging using CHERIseed.
{{ end_additional_notes }}

Based on the nature of the violation, a `SIGSEGV` or `SIGBUS` signal is raised when CHERIseed detects violation of capability semantics at runtime. These signals can have different signal codes depending on the type of violation. CHERIseed handles violations by giving intuitive and elaborate information related to the error. To know more about different behaviors supported by CHERIseed, refer to [CHERIseed.rst] [cheriseed-rst].

Inspecting the CHERIseed error message further, we see a `SIGSEGV` is raised because the capability is untagged. According to the CHERI design, capabilities should have an associated tag bit that can be cleared to mark a capability as invalid. This aims to ensure that operations with a capability can only be performed if that capability is derived through valid transformations of valid capabilities. Please refer to the [CHERIseed Design Doc] [cheriseed-design-rst] to see how CHERIseed supports capability tags.

Furthermore, we can choose how CHERIseed should behave when it encounters semantic rule violations, i.e., it is possible to configure which checks are disabled at compile time (using compiler flags) or at runtime (using APIs or environment variables). For compile-time configuration of the checks, use the clang option `-fsanitize-cheriseed-checks` with a valid value string - compile-time configuration of the checks can be different per source module. For our case, let us try runtime configuration to enable all but tag checks using environment variable `CHERISEED_CHECKS` which controls how CHERIseed behaves without the need to recompile the application.
{{ custom_code }}(gdb) set environment CHERISEED_CHECKS=-TAG
(gdb) run
Starting program: /home/cheriseed-workspace/string.bin

================================================================
{{red_c}}Runtime Error detected by CHERIseed{{end_c}}

Capability is missing required permission(s) at {{green_c}}0x77fff7febb60{{end_c}}:

{{green_c}}0x0000002050db{{end_c}} [{{green_c}}0x000000000000{{end_c}}-{{green_c}}0xffffffffffffffff{{end_c}}] {{cyan_c}}(invalid){{end_c}}

Missing permission(s):
{{magenta_c}}r{{end_c}} [{{magenta_c}}LOAD{{end_c}}]

Tag address was at {{green_c}}0x7f7ff77eebb6{{end_c}}

Shadow memory layout:
low [{{green_c}}0x77fff7ff0000{{end_c}}-{{green_c}}0x7f7ff77ef000{{end_c}}]
gap [{{green_c}}0x7f7ff77ef000{{end_c}}-{{green_c}}0x7ffff77ef000{{end_c}}]
high [{{green_c}}0x7ffff77ef000{{end_c}}-{{green_c}}0x7ffff7ff0000{{end_c}}]

# tid: {{green_c}}13167{{end_c}}

Program received signal SIGSEGV, Segmentation fault.
{{blue_c}}0x000000000023309a{{end_c}} in {{yellow_c}}morello::shim::svc_impl{{end_c}} () at {{green_c}}src/svc.cpp{{end_c}}:54
54 in {{green_c}}src/svc.cpp{{end_c}}
{{ end_custom_code }}

The message tells that the load permission is missing from the capability while a capability load is required to execute the line. This was already understood since the previous error message displayed that the capability is untagged with invalid bounds and no permissions.

Alternatively, we can use `__cheriseed_control_checks()` API for runtime checks. The first argument specifies if the checks set in the second argument are to be enabled or disabled. The API `__cheriseed_control_semantics()` enables or disables all CHERI semantics at once. For more details see [CHERIseed.rst] [cheriseed-rst]. For example, we can try to scope checks for `new_string()` invocation as followed.
{{ custom_highlight_remove_cr }}{% highlight c %}{% load_external_file https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/raw/40cc6e0565c4e210102516058f46f824db164752/cheriseed/001-blogpost/snippet_config_control.c %}{% endhighlight %}{{ end_custom_highlight }}

Printing the stack trace,

{{ custom_code }}(gdb) where
#0 {{blue_c}}0x000000000023309a{{end_c}} in {{yellow_c}}morello::shim::svc_impl{{end_c}} () at {{green_c}}src/svc.cpp{{end_c}}:54
#1 {{blue_c}}0x000000000023301a{{end_c}} in {{yellow_c}}morello::shim::svc{{end_c}} ({{cyan_c}}arg1{{end_c}}=..., {{cyan_c}}arg2{{end_c}}=..., {{cyan_c}}arg3{{end_c}}=..., {{cyan_c}}arg4{{end_c}}=..., {{cyan_c}}arg5{{end_c}}=..., {{cyan_c}}arg6{{end_c}}=..., {{cyan_c}}nr{{end_c}}=&lt;optimised out&gt;, {{cyan_c}}cg{{end_c}}=...) at {{green_c}}src/svc.cpp{{end_c}}:183
#2 {{blue_c}}0x0000000000238c38{{end_c}} in {{yellow_c}}morello::shim::syscall{{end_c}} ({{cyan_c}}arg1{{end_c}}=..., {{cyan_c}}arg2{{end_c}}=..., {{cyan_c}}arg3{{end_c}}=..., {{cyan_c}}arg4{{end_c}}=..., {{cyan_c}}arg5{{end_c}}=..., {{cyan_c}}arg6{{end_c}}=..., {{cyan_c}}nr{{end_c}}=&lt;optimised out&gt;, {{cyan_c}}cg{{end_c}}=...) at {{green_c}}build/gen/src/syscall.cpp{{end_c}}:370
#3 {{blue_c}}0x000000000023baef{{end_c}} in {{yellow_c}}**shim_syscall{{end_c}} ({{cyan_c}}cg{{end_c}}=..., {{cyan_c}}nr{{end_c}}=&lt;optimised out&gt;, {{cyan_c}}arg1{{end_c}}=..., {{cyan_c}}arg2{{end_c}}=..., {{cyan_c}}arg3{{end_c}}=..., {{cyan_c}}arg4{{end_c}}=..., {{cyan_c}}arg5{{end_c}}=..., {{cyan_c}}arg6{{end_c}}=...) at {{green_c}}build/gen/src/syscall.cpp{{end_c}}:1031
#4 {{blue_c}}0x000000000022c52f{{end_c}} in {{yellow_c}}Call{{end_c}} () at {{green_c}}/llvm-project/compiler-rt/lib/cheriseed/cheriseed_libc.cpp{{end_c}}:139
#5 {{blue_c}}0x000000000022bbde{{end_c}} in {{yellow_c}}Raise{{end_c}} () at {{green_c}}/llvm-project/compiler-rt/lib/cheriseed/cheriseed_libc.cpp{{end_c}}:400
#6 {{blue_c}}0x000000000022aa78{{end_c}} in {{yellow_c}}RaiseSignal{{end_c}} () at {{green_c}}/llvm-project/compiler-rt/lib/cheriseed/cheriseed_errors.cpp{{end_c}}:380
#7 {{blue_c}}0x0000000000228ab1{{end_c}} in {{yellow_c}}RaiseSignal{{end_c}}&lt;**cheriseed::error::NotTaggedError, **cheriseed::LocalCap const&&gt; () at {{green_c}}/llvm-project/compiler-rt/lib/cheriseed/cheriseed_errors.h{{end_c}}:309
#8 {{blue_c}}0x000000000022645c{{end_c}} in {{yellow_c}}NotTaggedViolation{{end_c}} () at {{green_c}}/llvm-project/compiler-rt/lib/cheriseed/cheriseed.cpp{{end_c}}:57
#9 {{yellow_c}}RequireTagged{{end_c}} () at {{green_c}}/llvm-project/compiler-rt/lib/cheriseed/cheriseed_local_cap.h{{end_c}}:106
#10 {{yellow_c}}**cheriseed_check_access{{end_c}} () at {{green_c}}/llvm-project/compiler-rt/lib/cheriseed/cheriseed.cpp{{end_c}}:698
#11 {{blue_c}}0x0000000000263aa9{{end_c}} in {{yellow_c}}memchr{{end_c}} ({{cyan_c}}src{{end_c}}=&lt;optimised out&gt;, {{cyan_c}}c{{end_c}}=&lt;optimised out&gt;, {{cyan_c}}n{{end_c}}=&lt;optimised out&gt;) at {{green_c}}src/string/memchr.c{{end_c}}:23
#12 {{blue_c}}0x00000000002639af{{end_c}} in {{yellow_c}}strnlen{{end_c}} ({{cyan_c}}s{{end_c}}=&lt;optimised out&gt;, {{cyan_c}}n{{end_c}}=&lt;optimised out&gt;) at {{green_c}}src/string/strnlen.c{{end_c}}:5
#13 {{blue_c}}0x0000000000273246{{end_c}} in {{yellow_c}}new_string{{end_c}} () at {{green_c}}string.c{{end_c}}:30
#14 {{blue_c}}0x000000000027345c{{end_c}} in {{yellow_c}}main{{end_c}} () at {{green_c}}string.c{{end_c}}:41
{{ end_custom_code }}

Because of how CHERIseed handles runtime calls, in backtrace we can see extra items at the top of stack trace. In our case, frame 11 is the one in concern and it resulted in untagged capability violation because `str_addr` in the function `new_string()` holds a `long` value which cannot represent a capability. To read more about this CHERI violations see [section 6.1 of CHERI C/C++ Programmers guide] [pro-guide]. Change from `long` to `intptr_t` at Line 28 solves this issue.

Running the program again gives the following output.

{{ custom_code }}(gdb) run
Starting program: /home/cheriseed-workspace/string.bin

================================================================
{{red_c}}Runtime Error detected by CHERIseed{{end_c}}

Prevented out-of-bounds access with capability at {{green_c}}0x77fff7fe7e50{{end_c}}:

{{green_c}}0x77fff7fed050{{end_c}} [{{magenta_c}}rwRW{{end_c}},{{green_c}}0x77fff7fed040{{end_c}}-{{green_c}}0x77fff7fed050{{end_c}}]

Requested range was {{green_c}}0x77fff7fed050{{end_c}}-{{green_c}}0x77fff7fed051{{end_c}}

Tag address was at {{green_c}}0x7f7ff77ee7e5{{end_c}}

Shadow memory layout:
low [{{green_c}}0x77fff7ff0000{{end_c}}-{{green_c}}0x7f7ff77ef000{{end_c}}]
gap [{{green_c}}0x7f7ff77ef000{{end_c}}-{{green_c}}0x7ffff77ef000{{end_c}}]
high [{{green_c}}0x7ffff77ef000{{end_c}}-{{green_c}}0x7ffff7ff0000{{end_c}}]

# tid: {{green_c}}15901{{end_c}}

Program received signal SIGSEGV, Segmentation fault.
{{blue_c}}0x000000000023309a{{end_c}} in {{yellow_c}}morello::shim::svc_impl{{end_c}} () at {{green_c}}src/svc.cpp{{end_c}}:54
54 {{green_c}}src/svc{{end_c}}.cpp: No such file or directory.
(gdb) where -2
#15 {{cyan_c}}0x00000000002785ff{{end_c}} in {{yellow_c}}printf{{end_c}} ({{cyan_c}}fmt{{end_c}}=&lt;optimised out&gt;) at {{green_c}}src/stdio/printf.c{{end_c}}:9
#16 {{cyan_c}}0x00000000002734c3{{end_c}} in {{yellow_c}}main{{end_c}} () at {{green_c}}after.c{{end_c}}:43
{{ end_custom_code }}

In this case, we see that the program progressed further and now the capability referencing the `str_addr` has length `0x10` and the capability limit is at `0x77fff7fed050` but the program counter at `0x0000002734c3` is accessing the range `0x77fff7fed050`-`0x77fff7fed051`. Having a close look at the trace we find that we are getting out-of-bounds error because we write over whole data including delimiters. Hence, we have found an illegal out of bound access in the source. This can be mitigated by increasing one byte to string’s data to store an additional delimiter value.

### Program is now more CHERI-ready

Finally, we have the source running successfully using CHERIseed and we can say the program is now more CHERI-ready, i.e., that the source can be built and run on CHERI hardware. CHERIseed made it easy for us interpret the bug by giving elaborate details of the which operation failed and which capability was to be corrected etc.

The [fix](diff-link):

```diff
{% load_external_file https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/commit/4ce0ecbfdb129a37e3d26aa7cfed966bcc7f47e1.diff %}
```

{{ additional_notes }}
{{ note_header }}Using CHERI-related headers{{ end_note_header }}
Let’s say we need the data of the string to be unmodifiable after we initialize them. CHERI compiler builtins are provided for accessing/modifying capability properties of pointers. For our use case, we can remove store permissions of the capability using {{ emphasize_me }}cheri_perms_and(){{ end_emphasize_me }} API.
{{ custom_highlight_remove_cr }}{% highlight c %}{% load_external_file https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/raw/40cc6e0565c4e210102516058f46f824db164752/cheriseed/001-blogpost/snippet_cheri_header.c %}{% endhighlight %}{{ end_custom_highlight }}
There are a set of builtin functions which provides access to capability properties. <a href="https://git.morello-project.org/morello/llvm-project/-/blob/cheriseed/clang/lib/Headers/cheriintrin.h">cheriintrin.h</a> provides interface to access and modify those properties including few capability permission constants. To learn more about this, see Sections 7 of the <a href="https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-947.pdf">CHERI C/C++ Programming Guide</a>. The compiler emits few warnings about the uses of improper casts which can be resolved easily.
{{ end_additional_notes }}

# Other Examples

1. <a data-toggle="modal" data-target="#exampleModal">
     Fiestel cipher example
   </a>

<div
  class="modal fade"
  id="exampleModal"
  tabindex="-1"
  aria-labelledby="exampleModalLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button
          type="button"
          class="close"
          data-dismiss="modal"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">{{ example_text }}</div>
      <div class="modal-footer"></div>
    </div>
  </div>
</div>

# Limitations

As mentioned in the introduction, CHERIseed should not be considered a replacement for hardware-enforced CHERI. Also, CHERIseed considers inline assembly snippets as “unsafe” because it cannot reason about what happens in the assembly. However, some forms of inline assembly are considered safe: compiler barriers and those which don’t take or return pointers. Some workarounds for these may include the use of compiler builtins, etc. to replace assembly with C/C++ code.
Also, CHERIseed does not have support for the following currently (the list is not exhaustive) and these could be great additions:

- Compiling without the flag `-mabi=purecap` is possible but CHERIseed hasn’t been sufficiently tested for Hybrid mode.
- A memory access performed from a signal handler to the same location as was being accessed at the moment when signal is received is not supported yet.
- Some more CHERI features are yet to be supported.

CHERIseed is still in its alpha phase. We successfully used CHERIseed to debug CHERI compatibility issues, however there are still bugs to be found in the tool. Please report them using the [link] [file-ticket].

For more details regarding CHERIseed limitations, [CHERIseed.rst] [cheriseed-rst].

# Inviting You to Collaborate and Contribute

Thank you for your interest in CHERIseed. It still needs work to make it robust and we are inviting you to try it, share your feedback, request a feature, or contribute to the code if you have time. To get started with contributing to code, please read testing and other submission guidelines as mentioned in [CHERIseed contribute] [cheriseed-rst].

To file a ticket at issues tracker, follow [here] [file-ticket].

_Copyright © 2022, Arm Ltd._

# References

[^ref1]: University of Cambridge, Computer Laboratory, 2014, Capability Hardware Enhanced RISC Instructions: CHERI Instruction-set architecture, Abstract, viewed October 2022 <https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-850.pdf>
[^ref2]: University of Cambridge, Computer Laboratory, 2020, Capability Hardware Enhanced RISC Instructions: CHERI Instruction-Set Architecture (Version 8), Chapter 2.4.5 “Source-Code and Binary Compatibility” viewed June 2021 <https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-951.pdf>
[^ref3]: University of Cambridge, Computer Laboratory, 2020, CHERI C/C++ Programming Guide, Section 2.1, viewed June 2021 <https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-947.pdf>

[morello-page]: /resources/how-morello-prevents-buffer-overreads-on-example-of-libjpeg-turbo-cve-2018-19664/
[pro-guide]: https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-947.pdf
[cheriseed-rst]: https://git.morello-project.org/morello/llvm-project/-/blob/cheriseed/clang/docs/CHERIseed.rst
[cheriseed-design-rst]: https://git.morello-project.org/morello/llvm-project/-/blob/cheriseed/clang/docs/CHERIseedDesign.rst
[cap-display-format]: https://github.com/CTSRD-CHERI/cheri-c-programming/wiki/Displaying-Capabilities#simplified-format

[file-ticket]: https://git.morello-project.org/morello/llvm-project/-/issues/new?issue&issue[title]=CHERIseed:%20%3Csummary%3E&issue[description]=%3Cdetails%3E

[source-link]: https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/raw/491db32a6a29fdc33144a2baeb82850094ee9866/cheriseed/001-blogpost/string/string.c
[diff-link]: https://git.morello-project.org/morello/android/vendor/arm/morello-examples/-/commit/146adba8e351c47069763286dd2d99e3931b64b6.diff
