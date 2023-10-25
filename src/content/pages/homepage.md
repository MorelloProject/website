---
title: Morello Platform Open Source Software
description: >
  Coming soon.
slug: ""
layout: ../../layouts/Flow.astro
hero:
  title: Welcome to the landing page for Morello Linux
  style: flex-column expandable_jumbotron background-image morello
  # include: morello_homepage_header_section.html
  background_image: ../../assets/images/content/iStock-1147065676.jpg
  first_section:
    image: ../../assets/images/content/iStock-1195413927.jpg
    image_alt: test image alt
    text: |-
      Morello is a research program led by Arm in association with partners and funded by the UKRI as
      part of the UK government [Digital Security by Design (DSbD) programme](https://www.ukri.org/innovation/industrial-strategy-challenge-fund/digital-security-by-design/) . It defines a new prototype security architecture based on CHERI (Capability Hardware Enhanced RISC Instructions).
  second_section:
    image: ../../assets/images/content/DSCF0218.jpg
    image_alt: second test image alt
    text: |-
      A DSbD technology platform prototype (the Morello board) provides a SoC implementation of the architecture. 
      This was created to enable software developers and researchers to explore real-world use cases and inform future development.
dev_section:
  [
    {
      image: ../../assets/images/content/icon-2.png,
      title: "Code repositories",
      url: "https://git.morello-project.org/morello",
      text: "Code repositories for Morello Linux environments",
    },
    {
      image: ../../assets/images/content/icon-1.png,
      title: "Arm Morello pages",
      url: "https://www.arm.com/architecture/cpu/morello",
      text: "Architecture specifications, hardware reference manuals, community forum, etc.",
    },
  ]

flow:
  - row: container_row
    style: bg-primary
    sections:
      - component: custom_include
        # source: dev_section.html
  - row: container_row
    style: bg-light morello-content
    sections:
      - component: text
        style: bg-white p-2 my-3
        text_content:
          text: |-
            ## Introduction
            This website is the home page for research on Capability aware Morello Linux environments. To learn more please refer to our [Morello Linux documentation](https://linux.morello-project.org/docs/).

            The Morello platform is supported by a number of evolving RTOS/OS environments at different stages of maturity. [CheriBSD](https://www.cheribsd.org/) is implemented and hosted separately by the University of Cambridge and SRI International and includes a memory-safe kernel, userspace and various example frameworks. The [CHERI OS-feature matrix]( https://www.morello-project.org/cheri-feature-matrix/) includes more information on features implemented by Morello Linux and CheriBSD operating systems.

      - component: text
        style: bg-white p-2 my-3
        text_content:
          text: |-
            ## Development Platforms
            ### Morello Hardware Development Platform

            The Morello hardware development platform is now available to organizations involved in defined research activities. Access to the platform is managed by the UK government's Digital Security by Design (DSbD) [Technology Access Programme](https://www.dsbd.tech/technology-access-programme/).

            ![alt text](../../src/assets/images/content/DSCF0211-Edit.jpg)

            To get started please refer to our [Morello User Guide](https://linux.morello-project.org/docs/user-guide/).

            ### Morello Platform Model

            The Morello Platform Model is an open access FVP (Fixed Virtual Platform) implementation aligned with the development board. It is available to download from Arm’s [Ecosystem FVP Developer page](https://developer.arm.com/tools-and-software/open-source-software/arm-platforms-software/arm-ecosystem-fvps).

            FVPs use Arm binary translation technology to create a register level functional model of system hardware (including processor, memory and peripherals) that can be run as an executable in a development environment. They implement a programmer’s view model suitable for software development, enabling execution of full software stacks on a widely available platform.

            To get started please refer to our [Morello Get Started Guide](https://linux.morello-project.org/).

      - component: text
        style: bg-white p-4 my-3
        text_content:
          text: |-
            ## Support and Contributions
            The Morello Gitlab and associated issues trackers are intended to enable Open Source Software development - supporting engineering contributions and targeted defects and patches relating to specific component projects. We welcome engineering collaboration.

            To start contributing to our software ecosystem based on Capability aware Linux please refer to our [Contributrion Process](https://git.morello-project.org/morello/kernel/linux/-/wikis/res/Linux_on_Morello_Contribution_Process.pdf) or for generic queries send and email to [linux-morello@op-lists.linaro.org](mailto:linux-morello@op-lists.linaro.org).

            Wider support queries and questions should be raised via Arm's [Morello forum](https://community.arm.com/support-forums/f/morello-forum)

            For questions specific to the CheriBSD environment visit [https://www.cheribsd.org/](https://www.cheribsd.org/)
---
