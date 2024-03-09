package kim.myeongjae.hackassembler

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe

class AssemblerKtTest : StringSpec({

    "Add" {
        assemble("""
            // This file is part of www.nand2tetris.org
            // and the book "The Elements of Computing Systems"
            // by Nisan and Schocken, MIT Press.
            // File name: projects/06/add/Add.asm

            // Computes R0 = 2 + 3  (R0 refers to RAM[0])

            @2
            D=A
            @3
            D=D+A
            @0
            M=D
        """.trimIndent()) shouldBe """
            0000000000000010
            1110110000010000
            0000000000000011
            1110000010010000
            0000000000000000
            1110001100001000
        """.trimIndent()
    }
})
