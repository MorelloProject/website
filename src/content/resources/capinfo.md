---
author: arm
title: Capinfo
date: 2021-09-17 09:00:00
category: resources
image: ../../assets/images/content/capinfo-thumb.png
---

We'd like to announce the release of the [Capinfo](/capinfo/) tool.

Morello capabilities hold a lot of information, compressed into a fairly small
number of bits, and decoding them manually (e.g. whilst debugging) is
non-trivial. Capinfo fully decodes Morello capabilities, showing all
permissions, bounds and other properties, and is an invaluable analysis tool for
anyone working on compilers, allocators or other software that needs to interact
with capabilities at a low level.

Capinfo also shows intermediate values from the decoding process, using
terminology consistent with [published literature][cheri-concentrate], so you
can see exactly how a given capability is decoded.

Also provided is a similar command-line tool, and a Rust crate implementing the
common decoding logic. The source for all components is available [in
Git][capinfo-src].

[capinfo-src]: https://git.morello-project.org/morello/utilities/capinfo/
[cheri-concentrate]: https://www.cl.cam.ac.uk/research/security/ctsrd/pdfs/2019tc-cheri-concentrate.pdf
