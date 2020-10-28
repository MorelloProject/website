---
title: Morello Platform Open Source Software
description: >
  Coming soon.
permalink: /
layout: flow
jumbotron:
  header_title: Welcome to the landing page for Morello Platform Open Source Software
  class: flex-column expandable_jumbotron background-image morello
  include: morello_homepage_header_section.html
  image: /assets/images/content/iStock-1147065676.jpg
  first_section:
    image: /assets/images/content/iStock-178487234.jpg
    image_alt: test image alt
    text: |-
      Morello is a research program led by Arm in association with partners and funded by the UKRI as
      part of the UK government [Digital Security by Design (DSbD) programme](https://www.ukri.org/innovation/industrial-strategy-challenge-fund/digital-security-by-design/) . It defines a new prototype security architecture based on CHERI (Capability Hardware Enhanced RISC Instructions).
  second_section:
    image: /assets/images/content/iStock-1195413927.jpg
    image_alt: second test image alt
    text: |-
      A System on Chip (SoC) implementation of the architecture will provide a DSbD technology 
      platform prototype, enabling industry and academic partners to test real-world use cases and 
      inform future development.
dev_section:
  first_column:
    icon: /assets/images/content/icon-2.png
    title: The Morello code repositories
    url: https://git.morello-project.org/
    text: |-
      Please refer to the top level [Documentation](https://git.morello-project.org/morello/docs) repository to get started.
  second_column:
    url: https://developer.arm.com/morello
    icon: /assets/images/content/icon-1.png
    title: Arm's Morello Developer pages
    text: |-
      Arm's [Developer pages](https://developer.arm.com/morello) provided curated resources for the Morello Program. Including 
      references to Architecture specifications, platform implementation details and documentation.
flow:
  - row: container_row
    style: bg-primary
    sections:
      - format: custom_include
        source: dev_section.html
  - row: container_row
    style: bg-light morello-content
    sections:
      - format: text
        style: bg-white p-4 my-3
        text_content:
          text: |-
            ## Development Platforms

            ### Morello Platform Model

            The Morello Platform Model is an open access FVP (Fixed Virtual Platform) implementation of the
            development platform, aligned with the future development board. Available to download from
            Arm's [Ecosystem FVP Developer page](https://developer.arm.com/tools-and-software/open-source-software/arm-platforms-software/arm-ecosystem-fvps).

            FVPs use Arm technology to create a virtual model of the system hardware that can be run as an
            executable in a development environment. They use binary translation technology to deliver
            functional simulations of Arm-based systems, including processor, memory, and peripherals. They
            implement a programmer's view suitable for software development and enable execution of full
            software stacks, providing a widely available platform ahead of silicon.

            ### Morello Hardware Development Platform

            The Morello hardware development platform will become available early in 2022 and will be
            supported by the same software stack. Note: Availability of hardware will be limited - platforms
            will be restricted to partners involved in defined research activities.
      - format: text
        style: bg-white p-4 my-3
        text_content:
          text: |-
            ## LLVM Compiler with Morello Support

            Morello is supported by LLVM-based open-source toolchains. Please note, these are experimental
            toolchains and as such features may be missing.

            ### Android LLVM/Clang toolchain

            Includes a C/C++ compiler (clang), linker (lld), debugger (lldb), various utilities (such as
            assembler & disassembler) and run-time libraries.

            ### Bare-metal toolchain for architecture exploration projects

            Includes a C/C++ compiler (clang), linker (lld), a standard C library (newlib), a standard C++
            library (libc++, libc++abi) and various utilities (such as assembler & disassembler).

            [Arm Development Studio Morello Edition](/coming-soon/) is also available as a development environment for the
            bare-metal configuration.

            ### AArch64 Linux LLVM/Clang toolchain

            This toolchain is an experimental AArch64 hosted variant, primarily intended to be used together
            with Arm's [Morello Instruction Emulator](/coming-soon/). It includes a C/C++ compiler (clang), linker (lld), various
            utilities and run-time libraries, but does not include a C library. See this [knowledge base article](/coming-soon/) for
            more details.
      - format: text
        style: bg-white p-4 my-3
        text_content:
          text: |-
            ## Firmware

            The Development Platform is supported by Morello aware ports of standard open source firmware
            components: [SCP firmware](https://github.com/ARM-software/SCP-firmware), [Trusted Firmware TF-A](https://www.trustedfirmware.org/), [UEFI EDK2](https://github.com/tianocore/edk2)
      - format: text
        style: bg-white p-4 my-3
        text_content:
          text: |-
            ## Morello Linux Kernel

            Modified ACK (Android common Kernel).
      - format: text
        style: bg-white p-4 my-3
        text_content:
          text: |-
            ## Nano Android

            An integrated Android stack supporting a reduced nano profile is hosted in the Morello code repositories.

            This includes initial modifications to a standard (arm64-v8a) AOSP to support capabilities.
            Including a modified Bionic library and some pure-capability application ports.
      - format: text
        style: bg-white p-4 my-3
        text_content:
          text: |-
            ## CheriBSD

            The University of Cambridge Computing Laboratory implementation of CheriBSD has also been
            ported to the Morello Platform. This provides a BSD implementation of a memory safe kernel and
            examples ports of application frameworks. CheriBSD is maintained and hosted by the University
            of Cambridge.

            - [https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/cheri-software.html](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/cheri-software.html)
            - [https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/cheri-morello-software.html](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/cheri-morello-software.html)
            - [https://github.com/CTSRD-CHERI/cheribsd](https://github.com/CTSRD-CHERI/cheribsd)
---
