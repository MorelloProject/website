---
dark_title: CHERI OS-feature matrix
description: >-
  To find out more about the Morello Project, please get in touch!
slug: /cheri-feature-matrix/
layout: "../../layouts/Flow.astro"
hero:
  title: CHERI OS-feature matrix
  background_image: ../../assets/images/content/iStock-1147065676.jpg

  # style: bg-[rgba(0, 0, 0, 0.7)] absolute w-full h-full

flow:
  - row: container_row
    style: bg-light
  - row: container_row
    style: bg-light morello-content
    sections:
      - component: text
        style: bg-white p-2 my-3
        text_content:
          text: |-
            Operating systems can implement CHERI software features alongseveral axes. This table captures key axes, and describes the maturity of those features for various OS projects. It is the intention that evolving Application Programming Interfaces (APIs) be similar or identical across operating systems, so as to support portable CHERI-enabled applications to the greatest extent possible.
            We will also aim to align design choices around OS Application Binary Interfaces (ABIs) where it makes sense, to permit similar arguments about security and more strongly aligned APIs, but also recognising and accepting existing design differences between the systems.

            Note: Morello is experimental computer hardware, and all software available for it – firmware, compilers, operating systems, and applications – is also experimental. There is ongoing work to provide end-user documentation, as well as flesh out the set of software packages available, but it will take several years to complete development of the full and mature software system. 

            It is therefore expected that difficulties will be encountered, and there are several venues where you can seek support:
            * For queries on CheriBSD, the CHERI protection model, and CHERI C/C++, you can join the
            [CHERI-CPU Slack channel](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/cheri-slack.html)
            * For queries relating to the evolving Morello Linux environment, please use the mailing lists outlined in this
            [document](https://git.morello-project.org/morello/kernel/linux/-/wikis/res/Linux_on_Morello_Contribution_Process.pdf)
            * For other general questions on Morello, please use the [ARM Morello forum](https://community.arm.com/support-forums/f/morello-forum)

            Users of Morello boards are welcome to provide feedback on missing material and technical features, including missing software
            dependencies, although these may take time to resolve.

      - component: text
        style: bg-white p-4 my-3
        text_content:
          text: |-
            ## Operating Systems

            ### CheriBSD (as of version 22.12)

            CheriBSD is a research operating system adapted from the open-source FreeBSD OS, intended to explore and illustrate how CHERI architectural features can be used by a complete experimental software stack. Developed since around 2012, CheriBSD is compiled using the CHERI Clang/LLVM compiler suite and includes a spatially memory-safe UNIX kernel and spatially memory-safe userspace
            including over 8,000 memory-safe third-party packages available to install. CheriBSD is installed on a Morello board using a USB stick, and supports an easy-to-configure memory-safe desktop environment.Various research features remain in progress including a shipped
            library-compartmentalisation model, and experimental support for heap temporal memory safety and co-process compartmentalisation available from development branches. CheriBSD can be cross-built from Ubuntu, macOS, and FreeBSD, or self-hosted on CheriBSD running
            on a Morello board. Open-source contributions are welcome and very much appreciated, including new third-party application adaptations to CHERI. The next planned release is 23.06 in mid-2023, which will include temporal safety and a CHERI-enabled hypervisor. The project
            website is [CheriBSD.org](https://www.cheribsd.org/).

            ### Morello Linux

            Morello Linux is an Arm led research project begun in 2022, which aims to explore the application of memory safety in OS environments based around an experimental fork of the Linux kernel. The initial
            focus of Morello Linux is the implementation of a new pure capability kernel-user ABI, supported by development in C libraries(initially musl libc) and tooling (Morello LLVM). Associated community driven work on a Yocto framework for evolving userspace ports is also underway. The current status of the project is focused on building the environment and is actively seeking contributions to help enable and accelerate the work. Future integration releases aim to expand the scope of the existing implementation and introduce GNU/glibc tooling. For more details on status visit the [morello-project.org](https://www.morello-project.org/) homepage.

      - component: text
        style: bg-white p-4 my-3 overflow-x-auto
        text_content:
          text: |-
            ## CHERI feature matrix

            | Feature | CheriBSD | Morello Linux |
            | --- | --- | --- |
            | USB stick installer image | Yes | Experimental |
            | Runs on Arm Morello boards | Yes | Yes |
            | Runs on Arm’s Fixed Virtual Platform (FVP) | Yes | Yes |
            | Runs on QEMU-Morello | Yes | - |
            | Kernel spatial safety | Yes | - |
            | Kernel temporal safety | - | - |
            | KGDB support for memory-safe kernels | Yes | -  |
            | KGDB support for memory-unsafe kernels | Yes | - (as above) |
            | Userspace spatial safety<br />(w/memory-unsafe kernel) | Yes | Yes |
            | Userspace spatial safety<br />(w/memory-safe kernel) | Yes | - |
            | Userspace temporal safety | Experimental<br />([caprevoke](https://github.com/CTSRD-CHERI/cheribsd/tree/caprevoke) - partially in [22.12](https://github.com/CTSRD-CHERI/cheripedia/wiki/HOWTO:-Use-Cornucopia-with-the-22.12-CheriBSD-Release)) | - |
            | Debugger for memory-safe userspace | Yes | Yes |
            | OS tracing for memory-unsafe userspace<br />(ftrace, DTrace, eBPF, ...) | Under development | Yes |
            | OS tracing for memory-safe userspace<br />(ftrace, DTrace, eBPF, ...) | - | - |
            | CHERI-enabled Type-2 hypervisor<br />(kvm, bhyve, ...) | Experimental<br />([morello-bhyve](https://github.com/CTSRD-CHERI/cheribsd/tree/morello-bhyve)) | Under development |
            | Userspace memory-safety protection<br />against kernel confused deputies | Yes | Under development |
            | Kernel module compartmentalisation | Experimental<br />([kernel-c18n](https://github.com/CTSRD-CHERI/cheribsd/tree/kernel-c18n)) | - |
            | Userspace library compartmentalisation | Experimental<br />(released in [22.12](https://man.cheribsd.org/cgi-bin/man.cgi/c18n)) | - |
            | Userspace co-process compartmentalisation | Experimental<br />([cocalls](https://github.com/CTSRD-CHERI/cheripedia/wiki/Colocation-Tutorial)) | - |
            | Legacy package manager and<br />prebuilt 64-bit packages | Yes<br />(full set - roughly 24,000) | Yes |
            | Memory-safe package manager and<br />prebuilt packages | Yes<br />(limited set - roughly 9,000) | - |
            | Memory-safe desktop stack | Yes | - |
---
