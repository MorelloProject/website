---
author: arm
title: Sense and Capability – Try Morello on Linux using Morello IE
date: 2023-05-08 09:00:00
category: resources
image: ../../assets/images/content/morelloie-thumb.png
description: A walkthrough guide that should help future CHERI and Morello users learn about using new CPU architecture features on Linux.
---

## Introduction

[Morello][MORELLO] is an experimental platform and a set of tools that aim to provide hands on experience with a new CPU architecture that allows to build more secure software. It extends Armv8.2-A profile with the features of the 129-bit [CHERI (Capability Hardware Enhanced RISC Instructions)][CHERI] protection model developed by SRI International and the University of Cambridge and at the same time it is backward compatible with the Armv8-A architecture systems.

Morello provides a number of primitives to help control memory access and protect memory from unintended use. This allows to offload most of routine operations such as bounds and permissions checks onto hardware thus promising an improvement in performance compared to software-only implementations. Morello also supports fine grained control of memory bounds which may be useful for more flexible partitioning of applications and libraries (aslo known as software compartmentalisation). Several control flow primitives and instructions allow implementing various levels of isolation with different security properties and performance overheads.

From a software engineer point of view, Morello is about enhancing pointers to data or code in memory of an application. In the world of so-called unsafe programming languages like C or C++, bugs and security vulnerabilities stemming from incorrect memory use are quite common. CHERI and Morello aim to address this without a need to significantly re-write or re-engineer existing software. Here we'll find out how to run Morello-enabled userspace applications in a Linux environment. We’ll learn about some of the tools that are available and that you may use to build, run, and debug Morello programs.

## Setting up your dev environment

Morello comes as a variety of platforms and environments. You can run and experiment with this new CPU architecture on a [Morello prototype board][BOARD], [Morello Platform Model (aka FVP)][FVP], or [Morello Instruction Emulator][MIE]. Other third-party options are also available, such as QEMU for Morello that was developed using publicly available information.

Morello platform model provides whole-system emulation in contrast with Morello instruction emulator that only provides userspace emulation. On FVP you can boot an operating system or run baremetal applications, for example, on FVP you can boot and run different Linux distributions or [CheriBSD][CHERIBSD]. On the other hand, setting up an FVP may be difficult for an inexperienced user, and one may not need full system emulation to work on userspace applications or libraries.

Because Morello is backward compatible with AArch64, you don’t need to have the entire distribution built for the Morello target (in fact, many libraries and packages may not be ported yet). The minimum requirement is to have an off-the-shelf AArch64 Linux distribution with a [kernel that supports Morello user-kernel ABI][KERNEL]. In an environment like this you would be able to build and run Morello applications and at the same time enjoy your favourite tools even if they are not yet adapted to use the CHERI features on Morello.

One of such tools would be a compiler that supports Morello target. There are two options that are available: [LLVM toolchain][LLVM] and [GCC toolchain][GCC]. Both can be downloaded in binary form for AArch64 hosts (as well as x86 hosts) or built from source. Another example is [Morello GDB][GDB] that is easier to build for AArch64 target and run as a native application to debug Morello programs running on a system on Morello FVP or Morello board.

Here we will focus on using Morello instruction emulator as it is a relatively new tool that is also quite flexible and easy to set up and get running.

Morello instruction emulator (or Morello IE) is an experimental tool for software developers and researchers who wish to experiment with the Morello architecture. It allows you to run userspace Morello applications on AArch64 Linux systems on a non-Morello hardware. The scope of this tool is application and library development which means it is meant to be used for userspace work rather than kernel or firmware (for these use cases you would need to use either Morello FVP or Morello board).

To run your first Morello hello world app, you will need the following: a toolchain to compile and link your application, a C library that supports Morello, and a platform to run your program on. We’ve covered the toolchain choices above. You can choose between two well-known open source options for a C library for Linux: the GCC toolchain comes with [Morello Glibc][GLIBC], and the LLVM toolchain can be used along with the Morello port of the [Musl C library][MUSL].

Here we’ll be using AArch64-hosted development environment since it is required for Morello IE. This tool aims to be lightweight and simple, that’s why it relies on most of the work to be done natively only emulating essential and new Morello bits.

To install Morello LLVM toolchain for Linux, you can download it from [this page][LLVM] or build from source following [this guide][BUILDLLVM]. The binaries are provided for both x86 and AArch64 hosts, and the build script allows for both hosts as well. Remember that this choice determines where you will be cross-compiling your Morello applications. If you can use the toolchain binaries on your AArch64 system, you can run Morello programs straight away using Morello IE, and the development process for you will be as similar to native as possible. Note that the prebuilt LLVM Linux toolchain does not contain a C library at the time of writing. You can build Musl C library from source following a [very simple guide][MUSL].

Installing Morello GCC toolchain binaries is very similar, just download version for your host system from [this page][GCC]. This bundle will also contain binaries for Morello Glibc as well as standard binutils such as `readelf` and `objdump`.

Morello IE requires a system with Linux AArch64 userspace. There are several options for this: an AWS Graviton 2 or 3 instance, a Windows on Arm laptop with WSL2, or anything else that may run an AArch64 Linux virtual machine. Since Morello is based on Arm v8.2, it is best to use Morello IE on a v8.2 compliant system, however support for v8.0 systems like Raspberry Pi may be added in future. Check [Morello IE page][MIE] for updates.

To install Morello IE on your AArch64 device, download it from [Morello IE page][MIE] and run the installer as a bash script:

```
$ bash morelloie-${VERSION}.tgz.sh --prefix=~/path/to/installation/directory
```

You will need to accept EULA. The installation script will unpack files into the preferred directory. We’ll assume below that you’ve modified your `PATH` and can use `morelloie` command directly:

```
$ morelloie --version
...

$ morelloie -- uname -m
aarch64

$ morelloie -- ~/path/to/installation/directory/examples/hello
Hello Morello
```

At this point we can go to the next step.

## Hello Morello

Let’s write and build our first Morello application. It will be a very simple hello world program:

```
// hello.c

#include <stdio.h>

int main(int argc, char *argv[])
{
    printf("Hello Morello\n");
    return 0;
}
```

Compile and link it using Morello Clang and Musl C library:

```
$ clang \
    -march=morello --target=aarch64-linux-musl_purecap --sysroot=${SYSROOT} \
    hello.c -o hello -static
```

Here `SYSROOT` denotes a directory where Musl binaries have been installed. We use static linking for brevity. If you prefer to use GCC, the command is very similar:

```
$ aarch64-none-linux-gnu-gcc -march=morello -mabi=purecap hello.c -o hello -static
```

The GCC toolchain doesn’t require you to specify a path to sysroot explicitly or use target triple, however you need to explicitly mention target architecture and ABI because the same toolchain may build binaries for AArch64 as well as for Morello.

Whatever toolchain you’re using, you will end up with a binary that is what we call a purecap Morello application. We’ll discuss the details of this later, but right now it’s important that when we run it, we’ll be using Morello, which is exactly what we want. To verify this, we can use the `llvm-readelf` tool (or just `readelf` if you use GNU toolchain):

```
$ llvm-readelf -h hello
...
  Machine:                           AArch64
  Entry point address:               0x210121
...
  Flags:                             0x10000, purecap
...
```

Some output above is omitted. Here we may notice two things: the entry point address `0x210121` is odd (pun indented), and the flags field contains `0x10000` which means "purecap" (see [Morello ELF spec][ELF]). Each of these things tells us that this is a purecap binary.

The `hello` binary you have now would run in the same way on any Morello platform, to run it on Morello IE, use:

```
$ morelloie -- ./hello
Hello Morello
```

Double hyphen separates emulator’s parameters from the target application’s command line.

Well done! We’ve run our first Morello app and it works! Surely, there are simpler ways to print "hello world". In fact, where is Morello in all this? Yes, we used a Morello toolchain to build the binary, but the code still looks the same as you would use for any other target platform. Well, that's the thing about Morello (and CHERI in general): normally, you shouldn't need to modify your code to compile it for a Morello target. Morello (and CHERI) "just works" behind the scenes gently taking care of your spatial memory safety.

When compiling more involved examples, you may see new compiler warnings, usually they are there for a good reason and may indicate some memory safety issue. This is one of those situations when you may need to change your code to let it compile without warnings for a Morello target. However, you will notice as well that after this change the same code builds nicely for a non-Morello target, and it even may work better because a bug may have been fixed.

## Purecap and hybrid

Now it's time to talk about purecap (pure capability) and hybrid Morello applications. The terms "purecap" and "hybrid" refer to ABI and the way pointers are represented in code. From an application developer's point of view, in a purecap program all pointers automatically become capabilities. This means that all memory accesses will happen via (and be controlled by) some specific capability. On the other hand, in a hybrid application, pointers are addresses unless explicitly defined as capabilities. So, a hybrid program would work in the same way as a native (AArch64) program until it encounters a pointer that is explicitly defined as a capability.

Let's step back and consider these terms: "pointer", "address", and "capability". A pointer is an abstract token that gives you access to some memory. An address is a 64-bit integer that denotes the location in virtual memory. And a capability is one implementation of a pointer. Another, more familiar, implementation is "integer pointer". We'll look deeper into capabilities and their properties in the next section. These three terms may be used in various contexts, but it's important to understand the difference between them whenever they happen to be in the same sentence.

We're used to integer implementation of pointers when a pointer doesn't contain any data except location. From a programmer's point of view, such a pointer can be expressed as `void *`, `size_t`, `uintptr_t` or even `unsigned long`. In Morello, both in purecap and hybrid applications, a pointer and an address are two different things. In purecap, when an unsigned integer type is needed to store a pointer, only the `uintptr_t` type can be used. If any other integer types are used, the pointer will be truncated to an address, and it will not be possible to convert it back into a dereferenceable pointer. Pointers are implemented as capabilities and contain more data in addition to an address.

Let's consider the following example:

```
// fun.c

#ifndef __CHERI__
#define __cheri_tocap
#define __capability
#endif

static int fun(int* __capability data, int n)
{
    return data[n];
}

int main(int argc, char *argv[])
{
    const int x = 42; // I'm a secret, please don't overwrite me!
    int data[3] = {0, 1, 2};
    return fun((__cheri_tocap int* __capability)data, 3);
}
```

Here we have a pointer `data` to an array of three `int` values. We pass it to the function `fun` along with a number (index) of an element that we want to get. Naturally, when this program is executed, it will result in an out of bounds access which may or may not lead to a segmentation fault. In fact, it most likely will not (if we build and run it as a native AArch64 application).

We have some additional scribbles in this code snippet: `__cheri_tocap` and `__capability` that actually make a huge difference. They tell the compiler that the objects they annotate are capabilities. This means that compiler will need to deduce how memory can be accessed via them.

To build the code above as a hybrid application, we will use the following command:

```
$ clang \
    -march=morello --target=aarch64-linux-gnu --sysroot=${SYSROOT} \
    -mllvm -aarch64-enable-range-checking=true \
    fun.c -o fun -static
```

Make sure to use AArch64 sysroot in the above command (you can build it from the same Musl repository you used to build purecap version of Musl just by applying different configure settings). In hybrid, we are explicit about capabilities, and only use them in our application code, so the runtime and startup code may remain native (AArch64). We also use a parameter that tells the compiler to enable bounds checking for the capabilities. Notice that the value of the `-march` option has changed compared to the command we used above to build our purecap application.

Let's run this app using Morello IE:

```
$ morelloie -- ./fun
[emulator] simulated capability fault at 210508 in thread 3251
Out of bounds access to 4 bytes at <address>
...
Segmentation fault
```

Some output has been omitted. What's happened here? We've got a segmentation fault! Yay! Well, normally people are upset about these things, but we just explicitly detected an out of bounds access that would otherwise go unnoticed. Don't believe me? Fair enough, compile the above program without Morello options `-march=morello` and `-mllvm` `-aarch64-enable-range-checking=true` and see what the program returns? 42? I guess we have all the answers now...

If you remove the bits `__cheri_tocap` and `__capability` from this program and build it using the command above (with all the Morello options still there) and run it, you'll get the same result, 42. So, the out of bounds access happened successfully despite us using Morello flags. Why? Because this is a hybrid Morello app where all pointers are old style addresses unless explicitly defined as capabilities.

Let's see what Morello IE can tell us about this situation. It comes with a simple debugger that may help you pause your program execution at some point and explore the current runtime state. When running the app, let's instruct the emulator to pause as soon as we enter the `fun` function:

```
$ morelloie -break fun -- ./fun
/* next instruction (2104fc:fun) */
/* 2104fc d10083ff sub     %sp $0x0020 lsl $0x00 -> %sp */
[2135:2104fc]
```

We have entered debugging mode of the emulator where we can use different commands to look around (you may type `m` or `help` for information about available commands). For example, let's see what's in the `C0` register that contains first argument of the function:

```
[2135:2104fc] print c0
c00 = 0x1:ffffc000:731c3310:0000ffff:fe9f3310
          tag: true
        value: 0x00000fffffe9f3310
         base: 0x00000fffffe9f3310
        limit: 0x00000fffffe9f331c
...
       length: 12
       offset: 0
...
```

The actual value, base, and limit that you see may of course differ, but you will definitely see length that is 12 and offset that is 0. The latter simply means that value of the capability is the same as its lower bound that we refer to as "base". The length is interesting: we never specified it explicitly, but the compiler did some job and figured that 3 values of type `int` should fit into a 12-byte chunk of memory. Seems right! Let's carry on: use `continue` command in the debugger prompt:

```
[2135:2104fc] continue
[emulator] simulated capability fault at 210510 in thread 2135
Out of bounds access to 4 bytes at fffffe9f331c
0x1:ffffc000:731c3310:0000ffff:fe9f331c
          tag: true
        value: 0x00000fffffe9f331c
         base: 0x00000fffffe9f3310
        limit: 0x00000fffffe9f331c
 ...
       length: 12
       offset: 12
...
```

Now offset is 12 which is right at the end of the 12-byte memory buffer and we're trying to read next 4 bytes. That's our out of bounds access. All right, I think we should have a closer look at Morello capabilities at this point.

But before we do this, there is one important point about hybrid applications. Yes, all pointers are addresses, but all memory reads and writes are still checked against a capability: this is so called default data capability or `DDC`. You may check its contents in Morello IE debugger by typing `print DDC`. Compare `DDC` for hybrid and purecap programs. In a hybrid application, when memory is accessed via an integer address (as opposed to using an explicitly defined capability), it will only succeed if this address is within bounds of the `DDC` capability.

## Capability and its properties

A capability is a token of authority over a continuous range of memory. It extends conventional pointers (addresses) with a number of properties (capabilities in Morello add some extra bits to CHERI capabilities). Here is the list of all such properties:

- Value – memory location address (the conventional pointer address).

- Tag – indicates if a capability is valid (and whether it can be dereferenced, i.e., used as a base address in a memory reference).

- Bounds – base, limit, validity (the latter shows whether current combination of base, value and limit are correctly encoded). Bounds make up a semi-closed interval where base is included, and limit is not.

- Global / Local – a property that shows whether a capability is global or local (ha-ha, see below though).

- Permissions – they control operations that are available via this capability (see below).

- Executable / System access / Executive – bits that define and describe executability of a capability.

- Object type – a property related to sealing of capabilities (see below).

- Flags – application defined bits.

A number of Morello features guarantee monotonicity of capabilities at a hardware level: with a few exceptions a capability "power" may only be decreased but never increased. Every correct operation on a capability will either leave its validity (tag), range and permissions unchanged or will reduce them. An attempt to increase bounds or permissions or forge a capability tag will result in either a capability that is not valid or in a fault. At higher exception levels this may not always be true, but at EL0 (in userspace) this will always hold on Morello.

A capability that is not valid (when its tag is 0) or which is out of bounds (value is outside the semi-closed `[base, limit)` range) cannot be dereferenced (cannot be used as a base register in a memory reference): an attempt to do so will result in a capability fault that is detected in hardware, trapped by the OS, and signalled to the process as `SIGSEGV`. In most cases, when something fishy is happening to a capability, its tag would be set to 0, and this may go unnoticed unless this capability is used for accessing memory. This means that some capability faults may be delayed with respect to the place in the execution path where they originate from.

Capability bounds show the range of memory that can be accessed via this capability. Due to restrictions on the representable bounds, in Morello bounds cannot have arbitrary granularity. For smaller lengths granularity is as small as 1 byte, for greater sizes it increases but the overhead (relative to the length) remains sufficiently small.

Every capability can be local or global. A global capability can be made local by clearing the `GLOBAL` bit, but the reverse operation is prohibited (in this sense this bit works like a permission), so a local capability cannot be elevated to global. This will make more sense when we learn about the permissions that define how memory write operations work through capabilities.

Permissions of a capability determine what operations are allowed via this capability. In a nutshell, they can be grouped into the following categories:

- data access (reading from and writing to memory),

- permission-like bits that aren't permissions per se but act like they in terms of monotonicity,

- code execution (this includes loading code from memory as well),

- custom permissions for specific use cases (such as compartment switches).

Data access permissions cover reading and writing memory operations and include:

- `LOAD` – read data (non-capability) from memory,

- `LOAD_CAP` – read a capability from memory,

- `MUTABLE_LOAD` – read a capability with permissions allowing mutable operations,

- `STORE` – write data (non-capability) to memory,

- `STORE_CAP` – write a capability,

- `STORE_LOCAL` – write a local capability (without this permission in the memory reference a local capability cannot be stored).

These permissions extend each other and do not work alone. For example, the `LOAD_CAP` permission alone will not allow to load a capability as you will also need the `LOAD` permission. The `_CAP` permissions control operations on capabilities. In Morello (and CHERI in general), loading or storing data becomes architecturally distinct from operations on pointers. You can load 16 bytes that contain your capability bit pattern in the usual non-capability way, but you won't be able to construct a valid pointer from it (unless you can forge validity tag on a higher exception level). These `_CAP` permissions are what implements this distinction: having a valid capability, one may load other valid capabilities via it only if it has corresponding permissions.

Normally, you don't need to use or set permissions directly because the runtime or libraries that generate capabilities should take care of it. For example, the `malloc` function from a purecap C library would, on success, return a valid capability with appropriate bounds and permissions that should include bits that allow reading and writing data and capabilities. However, in Morello you have finer grained control over permissions of the capabilities that you work with. For example, if you want to share some data for reading with a component of your application but also want to guarantee that, whatever happens in this component, your data stays intact, you may do so by removing write permissions from the capability that you share:

```
#include <cheriintrin.h>
...
char *ptr = malloc(64);
...
char *ro_ptr = cheri_perms_and(ptr, LOAD | LOAD_CAP | MUTABLE_LOAD);
```

Note that our compiler will provide macros for the permission bits but for brevity we shortened their names. The macros for these shorter names may be defined like this:

```
// perms.h

#pragma once

#define LOAD __CHERI_CAP_PERMISSION_PERMIT_LOAD__
#define LOAD_CAP __CHERI_CAP_PERMISSION_PERMIT_LOAD_CAPABILITY__
#define MUTABLE_LOAD __ARM_CAP_PERMISSION_MUTABLE_LOAD__

#define STORE __CHERI_CAP_PERMISSION_PERMIT_STORE__
#define STORE_CAP __CHERI_CAP_PERMISSION_PERMIT_STORE_CAPABILITY__
#define STORE_LOCAL __CHERI_CAP_PERMISSION_PERMIT_STORE_LOCAL__

#define EXECUTE __CHERI_CAP_PERMISSION_PERMIT_EXECUTE__
#define SYSTEM __CHERI_CAP_PERMISSION_ACCESS_SYSTEM_REGISTERS__
#define EXECUTIVE __ARM_CAP_PERMISSION_EXECUTIVE__

#define READ_CAP_PERMS LOAD | LOAD_CAP | MUTABLE_LOAD
#define WRITE_CAP_PERMS STORE | STORE_CAP | STORE_LOCAL
#define EXEC_CAP_PERMS EXECUTE | SYSTEM | EXECUTIVE
```

We'll be using this header in some of the examples below. Notice that some of the permission defines have prefix `__CHERI` and others have `__ARM`: the latter is for permissions that exist in Morello but don't exist in CHERI.

You can always rely on your programming language features to enforce read-only behaviour, but Morello permissions work regardless of the language you use, and you don't even have to know how this other component is implemented.

Let's see how we can observe capability permissions in Morello IE and what happens when we try to do something that is not permitted. Consider the following example:

```
char *str = calloc(64, 1);
/* const */ char *ro_str = cheri_perms_and(str, LOAD | LOAD_CAP | MUTABLE_LOAD);
str[0] = 'a';
printf("str: %s ro: %s\n", str, ro_str);
ro_str[0] = 'b';
```

If we build and run it, we'll see that it prints

```
str: a ro: a
```

because both pointers `str` and `ro_str` point to the same memory. However, an attempt to modify this memory via `ro_str` results in a capability fault due to insufficient permissions:

```
[emulator] simulated capability fault at 211520 in thread 3251
Insufficient permissions (required ----w-------------)
0x1:90100000:40900050:0000ffff:b0a90050
          tag: true
...
    in bounds: true
       length: 64
       offset: 0
  permissions: -rRM--------------
...
Segmentation fault
```

To write a byte we need `STORE` permission (shown as `w`) that doesn't exist in the capability that we used here (its permissions shown as `rRM`).

The need for the `MUTABLE_LOAD` and `STORE_LOCAL` permissions arise from situations when we want to control access via copies of the capabilities that are shared with other components of our program. Local capabilities cannot be made global and can only be saved to memory via a capability that has the `STORE_LOCAL` permission. This way we can implement control over spilling some of the capabilities into memory that we may eventually lose control of.

On the other hand, loading capabilities via a memory reference that doesn't have the `MUTABLE_LOAD` permission will result in a read-only capability: the following permissions are removed from the result of the memory read operation: `STORE`, `STORE_CAP`, `STORE_LOCAL`, and `MUTABLE_LOAD`. We won’t be able to use the loaded capability to store any data or to load any other capability that would allow storing data. This also means that any recursively loaded capability will have the above permissions removed. In other words, having a capability without the `MUTABLE_LOAD` permission and using it as a base register in a memory read operation, one can only produce read-only capabilities, regardless of what actually resides in memory. This can be used to (transitively) protect memory from being overwritten via any number of indirections even when a capability that allows writing to memory accidentally (or intentionally) is stored to a memory region with shared access.

Finally, let's look at the permissions relevant for executable capabilities. In Morello, an executable capability is any capability that has the `EXECUTE` permission. This permission essentially makes a capability into a function pointer. Other permissions that affect code execution are:

- `SYSTEM` – grants access to operations on system registers (for example, the `CCTLR_EL0` register),

- `EXECUTIVE` – controls which register banking is used when accessing certain registers such as `CSP` (capability stack pointer) and `DDC` (default data capability).

Each of these permissions extends the `EXECUTE` permission and won't work without it. The `EXECUTIVE` permission is relevant to compartments that we'll omit in this piece.

## Sealed capabilities

In CHERI and Morello, a capability can be sealed. Technically speaking, a capability is sealed when its object type is non-zero. Sealing a capability means four things. Sealing renders the capability immutable – any attempt to alter such a capability (for example, update its value even when keeping it within the bounds) would clear the tag of the resulting capability. A sealed capability cannot be dereferenced – that is, if a sealed capability is used as a base register in a memory operation (for either reading or writing), the operation will fault. Also, branching to an executable but sealed capability may fault as well at a point of instruction fetch at the target address if at this point the capability remains sealed. Finally, a sealed capability cannot be used to seal another capability even when meeting all other requirements for a sealing capability.

In Morello, object type is a 15-bit value. There are three special object types with lowest values that are referred to as "fixed" or "hardware" types:

- `RB` (value is 1) – used for all conventional register branch.

- `LPB` (value is 2) – used for load pair and branch operations (relevant to compartments).

- `LB` (value is 3) – used for load and branch operations (relevant to compartments).

All these three object types are supposed to be used in executable capabilities and don't mean anything otherwise. Each of these types correspond to some kind of branch operations, and a capability sealed this way will be automatically unsealed during the corresponding branch operation: a sealed target will become unsealed value of the `PCC` register (program counter capability).

In general, to seal a valid and unsealed capability (sealing an already sealed capability will render the result's tag cleared as any other modifying operation) one has to have another sealing capability. Such a capability would be valid to act as a sealer when it has tag equal to 1, includes the `SEAL` permission, and is within its bounds. The value of this sealer capability will be used as the object type for the result of the operation. The value of the sealer capability must also be not greater than maximum object type value (for Morello this is 2^15 - 1 = 32767), otherwise the result will have its tag cleared. The sealer itself must be unsealed as well. For unsealing it is the same except that another permission `UNSEAL` must be present.

A notable exception to the above is sealing with hardware object types. This can be done by special kind of instruction called "Seal (immediate)". It uses immediate operand to select object type of the result. This makes it very easy to seal a capability with any of the HW object types.

Let's consider the following example to see how a sealed capability may appear in your code.

```
// sealed.c

#include <stdio.h>

static void fun() {  }

int main(int argc, char *argv[])
{
    void *cap = fun;
    printf("%#p\n", cap);
}
```

What we do here is take some function's address and print it using extended format specifier which on Morello will print not only pointer's value, but also some extra information:

```
$ clang \
    -march=morello --target=aarch64-linux-musl_purecap --sysroot=${SYSROOT} \
    sealed.c -o sealed -static
$ morelloie -- ./sealed
0x21147d [rxRE,0x200200-0x226700] (sentry)
```

Here we see the value of the pointer `0x21147d`, its bounds (base: `0x200200`, limit: `0x226700`), permissions (`r` for `LOAD`, `x` for `EXECUTE`, `R` for `LOAD_CAP`, and `E` for `EXECUTIVE`), and finally we see sentry keyword which means that what we see is an executable capability that is sealed with the `RB` object type.

When running this program on Morello IE, we can pause right after entering the `printf` function and examine the input capabilities:

```
$ morelloie -break printf -- ./sealed
[3487:211a3c] p c1
c01 = 0x1:b090c000:8ce70044:00000000:0021147d
          tag: true
        value: 0x0000000000021147d
         base: 0x00000000000200200
        limit: 0x00000000000226700
 bounds valid: true
    in bounds: true
       length: 156928
       offset: 70269
  permissions: GrRM---xXS--------
       sealed: sealed RB
...
```

We've looked at the `C1` capability register because it corresponds to the second argument in our `printf` function call. We see that this capability is in fact sealed with the `RB` object type and that it is also a global capability (notice `G` in the permissions).

By the way, because `printf` is a variadic function, strictly speaking we should be accessing its arguments in a different way. According to [Morello PCS][PCS], a pointer to anonymous arguments will be put into the `C9` register, and we should follow the PCS specification to see where each argument is. In this example, we can see the same capability if we load a capability stored at address in the `C9` register in the debugger:

```
[3487:211a3c] cap c9+0
c01 = 0x1:b090c000:8ce70044:00000000:0021147d
          tag: true
        value: 0x0000000000021147d
         base: 0x00000000000200200
        limit: 0x00000000000226700
...
```

So, taking an address of a function will result in an `RB`-sealed capability. We can use it to for a branch operation but since it is sealed, we cannot modify it to subvert control flow. This also means that we can give a copy of this function pointer to some other component of our application, and this pointer will stay immutable: it wouldn't be possible to perform some pointer arithmetic on this pointer and use it to make the program jump to an arbitrary address.

Another example of a situation when you will encounter sealed capabilities is the capability holding return address (link register). On Morello, this is register `C30`. After jumping to the `printf` function, let's look at this register:

```
[3487:211a3c] p clr
CLR = 0x1:b090c000:8ce70044:00000000:0021146d
          tag: true
        value: 0x0000000000021146d
         base: 0x00000000000200200
        limit: 0x00000000000226700
 bounds valid: true
    in bounds: true
       length: 156928
       offset: 70253
  permissions: GrRM---xXS--------
       sealed: sealed RB
...
```

We can see that it's also sealed which means it's immutable and cannot be tampered with. This is one of the Morello and CHERI features that enforce control flow integrity. If we attempt to change the value of this register, we will get an invalid capability, and upon returning to the address of this register the application will segfault. However, we can always replace it with another valid and RB-sealed capability if we can find a way to create one.

## Sub-object bounds

It's time to look into how the compiler manages bounds for capabilities it instantiates. For example, when we declare a local variable, what does actually happen?

```
// bounds.c

#include <stdio.h>

int main(int argc, char *argv[])
{
    char buffer[23];
    printf("%#p\n", (void *)buffer);
    return 0;
}
```

Build and run this app (notice that we use -O3 to make the assembly simpler):

```
$ clang \
    -march=morello --target=aarch64-linux-musl_purecap --sysroot=${SYSROOT} \
    -O3 bounds.c -o bounds -static
...
$ morelloie -- ./bounds
0xffffd0eacf78 [rwRW,0xffffd0eacf78-0xffffd0eacf8f]
```

A pointer to a character array of size 23 is a capability with length 23, which seems reasonable. Let's see how the capability for `buffer` is created. Let's use `objdump` and `awk` tools to generate disassembly of the main function:

```
$ llvm-objdump -d bounds | awk -v RS= '/^[[:xdigit:]]+ <main>/'
00000000002113ec <main>:
  2113ec: ff 43 81 02  sub     csp, csp, #80
...
  2113f8: e0 63 00 02  add     c0, csp, #24   // set offset of the capability
  2113fc: 01 b8 cb c2  scbnds  c1, c0, #23    // set length
...
```

Compiler generates code that allocates 23 bytes on stack. This means that a capability is derived from the `CSP` capability with the right offset and then another instruction `SCBNDS` is used to set correct bounds (length) to this resulting capability. If we stop Morello IE debugger at address `211400`, (right after the `SCBNDS` instruction), we'll be able to examine this capability and object it points too:

```
$ morelloie -break 211400 -- ./bounds
[4424:211400] p c1
c01 = 0x1:dc104000:6f8f2f78:0000ffff:ce5a2f78
          tag: true
        value: 0x00000ffffce5a2f78
         base: 0x00000ffffce5a2f78
        limit: 0x00000ffffce5a2f8f
 ...
       length: 23
       offset: 0
 ...
[4424:211400] cstr 23 c1
[0000ffffce5a2f78] -- ``
```

In your case the `cstr` command may show some different contents because our memory buffer is not actually initialised.

Let's look at a more complex example:

```
// subobject.c

#include <stdio.h>

typedef struct {
    int x;
    int y;
    char data[20];
} my_obj_t;

int main(int argc, char *argv[])
{
    my_obj_t foo;
    printf("%zu\n", sizeof(my_obj_t));
    printf("%#p\n", (void *)foo.data);
    return 0;
}
```

Build it in the same way as the previous example and run it:

```
$ morelloie -- ./subobject
28
0xffffcb401f68 [rwRW,0xffffcb401f60-0xffffcb401f7c]
```

We print size of our struct which is 28 bytes (two `int`-s and one buffer of 20 bytes), seems correct. But the capability for the `data` buffer in the `my_obj_t` struct appears to be off. We can print it in Morello IE and will confirm that offset is 8 and the length is 28 instead of 20. Looks like this capability points to the `data` member but its bounds cover the entire object. So, we can do this:

```
foo.y = 13;
foo.data[-4] = 42;
printf("y = %d\n", foo.y); // that's still 13, right?
```

and get this:

```
y = 42
```

Surely, the compiler will warn us about using negative offset in `foo.data[-4]`, but we are still able to use capability to write something beyond its expected bounds. Why is that? If you examine the disassembly, you will find that the compiler didn't restrict capabilities for sub-objects to the tightest possible bounds, instead it used the size of the entire object. This is default behaviour that can be modified using the following compiler option:

```
-Xclang -cheri-bounds=subobject-safe
```

The `-cheri-bounds` parameter also accepts other values. The default is `conservative` which means bounds will be set only for stack allocations. The value we used above, `subobject-safe`, means setting bounds when taking a pointer to a subobject, `aggressive` will mean tightening bounds whenever feasible and not annotated as unsafe, and `very-aggressive` will also set bounds for `&array[index]` expressions. See `clang --help` for details.

The result of setting subobject bounds will be something like:

```
[emulator] simulated capability fault at 211464 in thread 4523
Out of bounds access to 1 byte at ffffd0b3df64
0x1:dc104000:5f7cdf68:0000ffff:d0b3df64
          tag: true
        value: 0x00000ffffd0b3df64
         base: 0x00000ffffd0b3df68
        limit: 0x00000ffffd0b3df7c
 bounds valid: true
    in bounds: false
       length: 20
       offset: -4
...
Segmentation fault
```

Obviously offset of -4 puts us out of bounds.

If you compare disassembly for both binaries (with and without `-cheri-bounds=subobject-safe`), you will notice that there are some additional instructions that compiler had to generate to set the bounds more tightly. We can use Morello IE to count instructions by using the `-stat` command line option:

```
$ morelloie -stat -- ./subobject
...
Statistics (process id: 4552)               Total
 Instr count total                           2528
...

$ morelloie -stat -- ./subobject-safe
...
Statistics (process id: 4569)               Total
 Instr count total                           2531
...
```

Additional security inevitably comes with some overhead.

## Purecap process on Linux

In addition to all this capability stuff related to pointers and objects, Morello also changes the way how the process is constructed when your program starts. A Morello-aware kernel or, more precisely, a PCuABI-compliant kernel will initialise the environment for a purecap process and make sure all the capabilities are properly defined. The way userspace interacts with kernel also changes. The details about this can be found in the [PCuABI specification document][PCUABI].

We can explore what this means in practice using a few simple examples. In a nutshell all the changes can be grouped into the following categories:

- initial process environment: `argc`, `argv`, `envp`, and `auxv`, also initial `CSP` and `PCC`;

- system calls and memory mappings;

- signal handlers.

Here we will focus on the initial environment created for each purecap process and briefly touch the topic of memory mappings in the next section. We will consider the case of a statically linked application because when dynamic linker is involved everything is a bit more cumbersome, but the idea is still very much the same. The changes to system calls and signal handling aspects of Morello are described in detail in the [PCuABI spec][PCUABI].

When a new purecap process is started and control passes over to the application, it is actually transferred to the `_start` function. This is the point where the userspace execution starts, and this is where we'll explore the initial environment. By the time control reaches the `main` function, a lot may have been changed or adjusted depending on the implementation of your C library or any other runtime. At the point of entry into the `_start` function we can examine the pristine purecap environment created for us by a PCuABI kernel. In case when we run our program on Morello IE, it will emulate PCuABI for us. Let's run our hello example and stop right after the very first executed instruction and then use the `info registers` debugger command to list all the registers:

```
$ morelloie -break _start+4 -- ./hello
[4672:2102e4] info registers
Reg       T Capability                          Base             Limit
C00         00000000:00000000:00000000:00000001
C01       1 dc104000:57205700:0000ffff:f46a5700 0000fffff46a5700 0000fffff46a5720
C02       1 dc104000:59305720:0000ffff:f46a5720 0000fffff46a5720 0000fffff46a5930
C03       1 dc104000:5d2f5930:0000ffff:f46a5930 0000fffff46a5930 0000fffff46a5d2f
...
CSP       1 dc104000:352ef52e:0000ffff:f46a5000 0000fffff3ea5000 0000fffff46a5000
...
PCC       1 b090c000:26070004:00000000:002102e0 0000000000200000 0000000000233000
```

Some data is omitted for brevity. Here we can see several important things. First of all, the `C0` register contains the `argc` value (number of elements in the process command line) which is in our case 1 (do experiment with different number of command line arguments and see what changes). Although it is a capability register, currently it only holds an integer value and has no other metadata such as bounds or permissions.

The `C1` register will have a pointer to an array consisting of 2 `char *` pointers (when number of command line arguments is 0). This is our `argv` pointer. The first element here will be a pointer to the string `./hello`, and the second will be a `NULL` pointer used to terminate the `argv` array in the usual way. We can see from the base and limit values for the `C1` register that its length is set to 32 bytes which is just enough to hold two pointers.

Let's look deeper at what `C1` points to. How do these 32 bytes pointed to by the `C1` capability look in memory?

```
[4672:2102e4] mem 32 c1
         Addr              +24              +16               +8               +0 Tags
 fffffb947080 ................ ................ 0000000000000000 0000000000000000 10
              c00040004593858b 0000fffffb94858b ................ ................ 10
```

The first element is a valid capability with its tag set (notice tags on the right), and the second chunk is all zeros (including tag) which is our fancy way to say this is `NULL`. OK, one more indirection: look at the string at address of the first element (your value here will most likely be different due to ASLR):

```
[4672:2102e4] cstr 64 0000fffffb94858b
[0000fffffb94858b] -- `./hello`
```

Seems all right. Let's explore further. The `C2` register is our `envp` which is a pointer to an array of strings each containing one environment variable. We can examine it in the same way and get something like:

```
[4672:2102e4] mem 32 c2
         Addr              +24              +16               +8               +0 Tags
 fffffb9470a0 ................ ................ c000400045b585a3 0000fffffb9485a3 11
 fffffb947080 c000400045a38593 0000fffffb948593 ................ ................ 10
[4672:2102e4] cstr 128 0000fffffb948593
[0000fffffb948593] -- `SHELL=/bin/bash`
```

Of course, your output may differ in detail, but the idea should be clear.

The `C3` register will be a pointer to `auxv`, the auxiliary vector. It has structure that you would expect, but each element takes up 32 bytes (compared to 16 bytes on AArch64): 16 bytes to fit the id of the element and another 16 bytes to fit a capability (when auxv element's value is a pointer). Only 8 bytes are actually used for id, and the size of 16 bytes is necessary due to alignment reasons. If we peek at the second element (read 32 bytes from address that is the value of `C3` plus 32 bytes):

```
[4672:2102e4] mem 32 c3+32
         Addr              +24              +16               +8               +0 Tags
 fffffb9472c0 0000000000000000 0000000000001270 0000000000000000 0000000000000033 00
```

In my case this is `AT_MINSIGSTKSZ` (0x33 = 51) which happens to be an integer with value 0x1270 (4720). In addition to standard auxv elements, Morello adds some new ones that contain capabilities with special properties. We will refer to some of them below, for comprehensive definition see the [PCuABI spec][PCUABI].

Because in Morello some `auxv` elements may be capabilities while others remain integers, a purecap compatible C library will provide new functions on Morello targets `getauxptr`. It works in the same way as the standard `getauxval` function, but it should be used when you need to get a capability from `auxv`.

The rest of the general-purpose registers are initialised with `NULL` except of course `CSP`. Its length is determined by the kernel and its offset is set to the limit of the capability because stack grows down:

```
[4672:2102e4] p csp
CSP = 0x1:dc104000:0a3e8a3e:0000ffff:fb947000
          tag: true
        value: 0x00000fffffb947000
         base: 0x00000fffffb147000
        limit: 0x00000fffffb947000
 bounds valid: true
    in bounds: false
       length: 8388608
       offset: 8388608
  permissions: GrRMwWL-----------
       sealed: (not sealed)
...
```

We can see that it is unsealed and has normal read and write permissions but naturally no execute permissions: stack is used for data and not for code. We may also notice that it's not in bounds, but this is simply because its offset is equal to its length which brings the value to the upper bound (limit) and it's not included in the range covered by this capability bounds.
We will let the reader to explore properties of the current `PCC` as an exercise. If you know how ELF files are organised, you may compare `PCC` bounds to the information you may get for the `readelf` tool or alike.

## Memory mappings

In the purecap world, the nature of the `mmap` syscall (and all the related system calls) changes significantly. This syscall returns a valid capability with bounds and permissions set according to the input flags and parameters. We will look at some examples in this section to illustrate how this works.

Typically, when you need to allocate some memory dynamically, you would use a function like `malloc`. This function should return a valid read-write capability with bounds set according to the requested size of the allocation. The permissions should allow general use for storing or loading data including pointers (capabilities). This may seem somewhat restrictive, but it is actually very much along the lines of Morello or CHERI: in most cases we don't need all the permissions, and when we do need something special, we should be explicit about it. So, if you need more control over your memory allocation properties, you may go one step deeper and use the `mmap` function.

```
// map.c

#include <stdio.h>
#include <sys/mman.h>

int main(int argc, char *argv[])
{
    int prot = PROT_READ | PROT_WRITE;
    int flags = MAP_PRIVATE | MAP_ANONYMOUS;
    char *cap = mmap(NULL, 1024, prot, flags, -1, 0);
    printf("cap = %#p\n", cap);
    return 0;
}
```

The protection properties and mapping flags supplied as `mmap` arguments will determine permissions that the resulting capability will hold. The `PROT_READ` protection will result in ability to do load operations via the capability returned by `mmap`, `PROT_WRITE` means that we'll be able to do store operations, and `PROT_EXEC` means we will be able to construct function pointers or branch targets from the capability obtained via `mmap`.

When working with system calls on Morello, you may see some errors that you wouldn't normally expect. This is because a PCuABI kernel is stricter about some of the system calls and may generate new types of errors. When using Morello IE, do try the `-strace` emulator option to get detailed information about system calls:

```
$ morelloie -strace -- ./map
...
[emulator] 211a80: mmap: $0=0x0000, $1=0x0400, $2=0x0003, $3=0x0022, $4=0xffffffffffffffff, $5=0x0000
[emulator] 211a80: mmap: 0x1:dc114000:40007000:0000ffff:a2377000 (success)
...
```

Since in CHERI and Morello loading or storing data is architecturally distinct from doing these operations on pointers, `mmap` gives you some flexibility here too. The capability related permissions (`LOAD_CAP` and `MUTABLE_LOAD` for `PROT_READ`, `STORE_CAP` and `STORE_LOCAL` for `PROT_WRITE`) will be added to the `mmap`'s result only if the mapping to be created is private (`MAP_PRIVATE` flags is used). In Morello, one cannot store a capability into a file or share it with another process via a shared mapping: the 16 bytes of the body of the capability can be shared of course, but the validity tag bit will be lost during this transition.

One other important change related to Morello and described in the PCuABI spec is the new protection flags introduced via the `PROT_MAX` macro. The need for them arises from the fact that in Morello protection attributes of a memory mapping are not tightly linked to the permissions of the capability returned for this mapping. The protection attributes may be altered by using the `mprotect` system call, but its interface doesn't allow the kernel to return a capability that would be updated accordingly (permission-wise). So, if you change the mapping protection level using `mprotect`, you may not be able to perform the required operation due to restriction imposed by the capability permissions. To work around this in Morello, you may create a memory mapping with the required initial protection attributes while also explicitly asking for higher capability permissions that will match the protection attributes that you will eventually set via a call to `mprotect`.

For example, consider a case when you want to create a memory mapping with `PROT_READ | PROT_WRITE` protection to write some executable code into it and then change its protection attributes to `PROT_READ | PROT_EXEC` by calling `mprotect`. Using `PROT_READ` and `PROT_WRITE` protection flags alone will give you a capability without the `EXECUTE` permission. Using `mprotect` later won't change your capability's permissions. That's why your first `mmap` call should use the `PROT_MAX` macro:

```
// map.c

#include <stdio.h>
#include <sys/mman.h>
#include <cheriintrin.h>

#include "perms.h"

int main(int argc, char *argv[])
{
    int prot_max = PROT_READ | PROT_WRITE | PROT_EXECUTE;
    int prot = PROT_READ | PROT_WRITE | PROT_MAX(prot_max);
    int flags = MAP_PRIVATE | MAP_ANONYMOUS;

    char *cap = mmap(NULL, 1024, prot, flags, -1, 0);
    char *cap_rw = cheri_perms_clear(cap, EXEC_CAP_PERMS);
    char *cap_rx = cheri_perms_clear(cap, WRITE_CAP_PERMS);

    printf("cap = %#p\nrw  = %#p\nrx  = %#p\n", cap, cap_rw, cap_rx);
    return 0;
}
```

After building and running it, you should see something like this:

```
$ morelloie -- ./map
cap = 0xffff9f812000 [rwxRWE,0xffff9f812000-0xffff9f813000]
rw  = 0xffff9f812000 [rwRW,0xffff9f812000-0xffff9f813000]
rx  = 0xffff9f812000 [rxRE,0xffff9f812000-0xffff9f813000]
```

In terms of memory protection attributes, all three capabilities, `cap`, `cap_rw` and `cap_rx`, in the example above point to the same memory mapping that is ready for read-write access but cannot be executed. The capability permissions are different though. In order for an operation to be successful, both current protection attributes and capability permissions should allow for this operation. Memory protection can be altered with `mprotect`, but capability permissions may only be reduced.

In this example, after updating the contents of the memory mapping, we can do this:

```
mprotect(cap, 1024, PROT_READ | PROT_EXEC);
```

and then derive a function pointer from the `cap_rx` capability. We shouldn't forget to seal it of course:

```
my_fun_t fun = cheri_sentry_create(cap_rx);
```

You probably noticed the use of the `cheri_` functions that are defined in the `cheriintrin.h` header file provided by the compiler. You can find an outline of such functions in the last section below.

## Conclusion

We've considered a number of examples and use cases that hopefully illustrate what Morello and CHERI means. We managed to build and run these examples and explore runtime details. The Morello IE tool we used should allow you to experiment with Morello, help port your code to Morello, run and debug it to understand what may have gone wrong. In addition, you can use it to measure performance of your application and analyse runtime statistics produced by your workloads. See [Morello IE user guide][MIEGUIDE] for the comprehensive description of Morello IE features.

## Compiler builtins

Here you can find a short overview of compiler builtins that may be useful when working with capabilities directly. Note, that these functions only exist on CHERI or Morello targets and therefore code that uses them is not portable. It is recommended to use declarations from the `cheriintrin.h` header provided by CHERI or Morello compiler rather than using these builtins directly.

#### Obtaining ambient capabilities

```
// Get DDC (Default Data Capability)
// Use as "cheri_ddc_get" declared in cheriintrin.h
void *__builtin_cheri_global_data_get();

// Get PCC (Program Counter Capability)
// Use as "cheri_pcc_get" declared in cheriintrin.h
void *__builtin_cheri_program_counter_get();

// Get CSP (Capability Stack Pointer)
// Note: not available in Morello GCC
void *__builtin_cheri_stack_get();
```

#### Get information about a capability

```
// Get validity tag
// Use as "cheri_tag_get" declared in cheriintrin.h
bool __builtin_cheri_tag_get(const void *cap);

// Get capability base (lower bound)
// Use as "cheri_base_get" declared in cheriintrin.h
size_t __builtin_cheri_base_get(const void *cap);

// Get capability length
// Use as "cheri_length_get" declared in cheriintrin.h
size_t __builtin_cheri_length_get(const void *cap);

// Get capability offset
// Use as "cheri_offset_get" declared in cheriintrin.h
size_t __builtin_cheri_offset_get(const void *cap);

// Get capability value (memory location address)
// Use as "cheri_address_get" declared in cheriintrin.h
size_t __builtin_cheri_address_get(const void *cap);

// Get capability permissions
// Use as "cheri_perms_get" declared in cheriintrin.h
size_t __builtin_cheri_perms_get(const void *cap);

// Get capability flags
// Use as "cheri_flags_get" declared in cheriintrin.h
size_t __builtin_cheri_flags_get(const void *cap);

// Get object type (include "stddef.h" for ptrdiff_t)
// Use as "cheri_type_get" declared in cheriintrin.h
ptrdiff_t __builtin_cheri_type_get(const void *cap);

// Check if capability is sealed
// Use as "cheri_is_sealed" declared in cheriintrin.h
bool __builtin_cheri_sealed_get(const void *cap);

// Get bits 65:127 of a capability
size_t __builtin_cheri_copy_from_high(const void *cap);
```

There is no builtin for getting capability limit. You can use a combination of

```
size_t limit = cheri_base_get(cap) + cheri_length_get(cap);
```

to achieve this.

#### Modifying capabilities

```
// Set length of a capability (may result in bigger length than requested
// if the latter is not representable)
// Use as "cheri_bounds_set" declared in cheriintrin.h
void *__builtin_cheri_bounds_set(const void *cap, size_t length);

// Set length of a capability (may clear tag of the result if the
// requested length is not representable)
// Use as "cheri_bounds_set_exact" declared in cheriintrin.h
void *__builtin_cheri_bounds_set_exact(const void *cap, size_t length);

// Set capability flags
// Use as "cheri_flags_set" declared in cheriintrin.h
void *__builtin_cheri_flags_set(const void *cap, size_t flags);

// Set capability offset
// Use as "cheri_offset_set" declared in cheriintrin.h
void *__builtin_cheri_offset_set(const void *cap, size_t offset);

// Increment capability offset
void *__builtin_cheri_offset_increment(const void *cap , size_t inc);

// Set capability value (address)
// Use as "cheri_address_set" declared in cheriintrin.h
void *__builtin_cheri_address_set(const void *cap, size_t address);

// Set upper 64 bits of a capability (will clear its tag)
void *__builtin_cheri_copy_to_high(const void *cap, size_t hi);

// Clear capability tag. Note: there isn't any tag_set function
// Use as "cheri_tag_clear" declared in cheriintrin.h
void *__builtin_cheri_tag_clear(const void *cap);

// Apply bit mask to capability permissions (should be used to
// clear certain permissions or make sure only certain permission are set)
// Use as "cheri_perms_and" declared in cheriintrin.h
void *__builtin_cheri_perms_and(const void *cap, size_t perms);

// Convert pointer to capability from another capability,
// with null capability from zero semantics.
// Note: not available in Morello GCC
void *__builtin_cheri_cap_from_pointer(const void *cap, size_t address);
```

One notable use case is worth looking at: create a capability with given length with some required offset (i.e., given bounds) from a source capability that potentially has larger bounds. Consider the following example:

```
#include <stdio.h>
#include <cheriintrin.h>

int main() {
    const void *csp = __builtin_cheri_stack_get();
    void *cap = __builtin_cheri_offset_increment(csp, -64);
    cap = cheri_bounds_set(cap, 64);
    cap = cheri_offset_set(cap, 16);
    printf("cap = %#p\n", cap);
    return 0;
}
```

Here we derive a capability from `CSP` and set its base to `csp.address - 64` and its length is 64 bytes while its offset is 16 bytes (with respect to the base value).

It is also important to understand difference between the `__builtin_cheri_address_set` and `__builtin_cheri_cap_from_pointer` builtins. The former will set value of the capability potentially creating an invalid capability while the latter will also create a `NULL` capability if the address is zero.

#### Sealing and unsealing capabilities

```
// Seal function pointer (creating a sentry)
// On Morello, this creates RB-sealed capability.
// Use as "cheri_sentry_create" declared in cheriintrin.h
void *__builtin_cheri_seal_entry(const void *cap);

// Seal a capability using another sealer capability
// Use as "cheri_seal" declared in cheriintrin.h
void *__builtin_cheri_seal(const void *cap, const void *sealer);

// Conditionally seal a capability using another sealer capability
// Use as "cheri_seal_conditionally" declared in cheriintrin.h
void *__builtin_cheri_conditional_seal(const void *cap, const void *sealer);

// Unseal capability using another unsealing capability
// Use as "cheri_unseal" declared in cheriintrin.h
void *__builtin_cheri_unseal(const void *cap, const void *sealer);

// Set capability value to the object type of another capability
// Use as "cheri_type_copy" declared in cheriintrin.h
void *__builtin_cheri_cap_type_copy(const void *cap, const void *otype);
```

Note: there is no builtin for LPB and LB object types, you will need to use inline assembly for this:

```
inline __attribute__ ((naked))
void *__morello_seal_lpb(void *cap)
{
    void *ret;
    __asm__ ("seal %0, %1, lpb" : "=C"(ret) : "C"(cap));
    return ret;
}

inline __attribute__ ((naked))
void *__morello_seal_lb(void *cap)
{
    void *ret;
    __asm__ ("seal %0, %1, lb" : "=C"(ret) : "C"(cap));
    return ret;
}
```

#### Compare capabilities

```
// Check if two capabilities are equal (have the same bit encoding)
// Use as "cheri_is_equal_exact" declared in cheriintrin.h
bool __builtin_cheri_equal_exact(const void *lhs, const void *rhs)

// Check if first capability is subset of the second
// (in terms of bounds and permissions)
// Use as "cheri_is_subset" declared in cheriintrin.h
bool __builtin_cheri_subset_test(const void *subcap, const void *cap);
```

#### Operations for bounds representability

```
// Round capability length to representable value
// Use as "cheri_representable_length" declared in cheriintrin.h
size_t __builtin_cheri_round_representable_length(size_t length);

// Generate alignment mask that can be used to generate representable bounds
// Use as "cheri_representable_alignment_mask" declared in cheriintrin.h
size_t __builtin_cheri_representable_alignment_mask(size_t length);
```

#### Miscellaneous

```
// Load 4 capability tags for consecutive capabilities in memory
// pointed to by the given capability (must be 64 bytes aligned)
// Use as "cheri_tags_load" declared in cheriintrin.h
// Note: not available in Morello GCC
size_t __builtin_cheri_cap_load_tags(const void *cap);

// Build capability from untagged and possibly sealed bit pattern
// Will result in a valid capability if the bit pattern forms a
// subset of the test capability
// Use as "cheri_cap_build" declared in cheriintrin.h
void *__builtin_cheri_cap_build(const void *key, unsigned __intcap bits);
```

---

[MORELLO]: https://www.arm.com/architecture/cpu/morello
[CHERI]: https://www.cl.cam.ac.uk/research/security/ctsrd/cheri
[BOARD]: https://www.arm.com/company/news/2022/01/morello-research-program-hits-major-milestone-with-hardware-now-available-for-testing
[FVP]: https://developer.arm.com/downloads/-/arm-ecosystem-fvps
[MIE]: https://developer.arm.com/downloads/-/morello-instruction-emulator
[CHERIBSD]: https://www.cheribsd.org/
[KERNEL]: https://git.morello-project.org/morello/kernel/linux
[LLVM]: https://git.morello-project.org/morello/llvm-project-releases
[GCC]: https://developer.arm.com/downloads/-/arm-gnu-toolchain-for-morello-downloads
[GDB]: https://sourceware.org/git/?p=binutils-gdb.git;a=shortlog;h=refs/heads/users/ARM/morello-binutils-gdb-master
[GLIBC]: https://sourceware.org/git/?p=glibc.git;a=shortlog;h=refs/heads/arm/morello/main
[MUSL]: https://git.morello-project.org/morello/musl-libc
[BUILDLLVM]: https://git.morello-project.org/morello/musl-libc/-/blob/morello/master/build-morello-clang.rst
[MIEGUIDE]: https://developer.arm.com/documentation/102270/latest
[ELF]: https://github.com/ARM-software/abi-aa/blob/main/aaelf64-morello/aaelf64-morello.rst
[PCS]: https://github.com/ARM-software/abi-aa/blob/main/aapcs64-morello/aapcs64-morello.rst
[PCUABI]: https://git.morello-project.org/morello/kernel/linux/-/wikis/Morello-pure-capability-kernel-user-Linux-ABI-specification
