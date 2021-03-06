/// <reference path="..\..\compiler\parser.ts" />
/// <reference path="..\harness.ts" />

namespace ts {
    describe("JSDocParsing", () => {
        describe("TypeExpressions", () => {
            function parsesCorrectly(name: string, content: string) {
                it(name, () => {
                    const typeAndDiagnostics = ts.parseJSDocTypeExpressionForTests(content);
                    assert.isTrue(typeAndDiagnostics && typeAndDiagnostics.diagnostics.length === 0, "no errors issued");

                    Harness.Baseline.runBaseline("JSDocParsing/TypeExpressions.parsesCorrectly." + name + ".json",
                        () => Utils.sourceFileToJSON(typeAndDiagnostics.jsDocTypeExpression.type));
                });
            }

            function parsesIncorrectly(name: string, content: string) {
                it(name, () => {
                    const type = ts.parseJSDocTypeExpressionForTests(content);
                    assert.isTrue(!type || type.diagnostics.length > 0);
                });
            }

            describe("parseCorrectly", () => {
                parsesCorrectly("unknownType", "{?}");
                parsesCorrectly("allType", "{*}");
                parsesCorrectly("nullableType", "{?number}");
                parsesCorrectly("nullableType2", "{number?}");
                parsesCorrectly("nonNullableType", "{!number}");
                parsesCorrectly("nonNullableType2", "{number!}");
                parsesCorrectly("recordType1", "{{}}");
                parsesCorrectly("recordType2", "{{foo}}");
                parsesCorrectly("recordType3", "{{foo: number}}");
                parsesCorrectly("recordType4", "{{foo, bar}}");
                parsesCorrectly("recordType5", "{{foo: number, bar}}");
                parsesCorrectly("recordType6", "{{foo, bar: number}}");
                parsesCorrectly("recordType7", "{{foo: number, bar: number}}");
                parsesCorrectly("recordType8", "{{function}}");
                parsesCorrectly("trailingCommaInRecordType", "{{a,}}");
                parsesCorrectly("callSignatureInRecordType", "{{(): number}}");
                parsesCorrectly("methodInRecordType", "{{foo(): number}}");
                parsesCorrectly("unionType", "{(number|string)}");
                parsesCorrectly("topLevelNoParenUnionType", "{number|string}");
                parsesCorrectly("functionType1", "{function()}");
                parsesCorrectly("functionType2", "{function(string, boolean)}");
                parsesCorrectly("functionReturnType1", "{function(string, boolean)}");
                parsesCorrectly("thisType1", "{this:a.b}");
                parsesCorrectly("newType1", "{new:a.b}");
                parsesCorrectly("variadicType", "{...number}");
                parsesCorrectly("optionalType", "{number=}");
                parsesCorrectly("optionalNullable", "{?=}");
                parsesCorrectly("typeReference1", "{a.<number>}");
                parsesCorrectly("typeReference2", "{a.<number,string>}");
                parsesCorrectly("typeReference3", "{a.function}");
                parsesCorrectly("arrayType1", "{a[]}");
                parsesCorrectly("arrayType2", "{a[][]}");
                parsesCorrectly("arrayType3", "{a[][]=}");
                parsesCorrectly("keyword1", "{var}");
                parsesCorrectly("keyword2", "{null}");
                parsesCorrectly("keyword3", "{undefined}");
                parsesCorrectly("tupleType0", "{[]}");
                parsesCorrectly("tupleType1", "{[number]}");
                parsesCorrectly("tupleType2", "{[number,string]}");
                parsesCorrectly("tupleType3", "{[number,string,boolean]}");
           });

            describe("parsesIncorrectly", () => {
                parsesIncorrectly("emptyType", "{}");
                parsesIncorrectly("unionTypeWithTrailingBar", "{(a|)}");
                parsesIncorrectly("unionTypeWithoutTypes", "{()}");
                parsesIncorrectly("nullableTypeWithoutType", "{!}");
                parsesIncorrectly("functionTypeWithTrailingComma", "{function(a,)}");
                parsesIncorrectly("thisWithoutType", "{this:}");
                parsesIncorrectly("newWithoutType", "{new:}");
                parsesIncorrectly("variadicWithoutType", "{...}");
                parsesIncorrectly("optionalWithoutType", "{=}");
                parsesIncorrectly("allWithType", "{*foo}");
                parsesIncorrectly("typeArgumentsNotFollowingDot", "{a<>}");
                parsesIncorrectly("emptyTypeArguments", "{a.<>}");
                parsesIncorrectly("typeArgumentsWithTrailingComma", "{a.<a,>}");
                parsesIncorrectly("tsFunctionType", "{() => string}");
                parsesIncorrectly("tsConstructoType", "{new () => string}");
                parsesIncorrectly("typeOfType", "{typeof M}");
                parsesIncorrectly("namedParameter", "{function(a: number)}");
                parsesIncorrectly("tupleTypeWithComma", "{[,]}");
                parsesIncorrectly("tupleTypeWithTrailingComma", "{[number,]}");
                parsesIncorrectly("tupleTypeWithLeadingComma", "{[,number]}");
            });
        });

        describe("DocComments", () => {
            function parsesCorrectly(name: string, content: string) {
                it(name, () => {
                    const comment = parseIsolatedJSDocComment(content);
                    if (!comment) {
                        Debug.fail("Comment failed to parse entirely");
                    }
                    if (comment.diagnostics.length > 0) {
                        Debug.fail("Comment has at least one diagnostic: " + comment.diagnostics[0].messageText);
                    }

                    Harness.Baseline.runBaseline("JSDocParsing/DocComments.parsesCorrectly." + name + ".json",
                        () => JSON.stringify(comment.jsDoc,
                            (_, v) => v && v.pos !== undefined ? JSON.parse(Utils.sourceFileToJSON(v)) : v, 4));
                });
            }

            function parsesIncorrectly(name: string, content: string) {
                it(name, () => {
                    const type = parseIsolatedJSDocComment(content);
                    assert.isTrue(!type || type.diagnostics.length > 0);
                });
            }

            describe("parsesIncorrectly", () => {
                parsesIncorrectly("emptyComment", "/***/");
                parsesIncorrectly("threeAsterisks", "/*** */");
                parsesIncorrectly("multipleTypes",
                        `/**
  * @type {number}
  * @type {string}
  */`);
                parsesIncorrectly("multipleReturnTypes",
                        `/**
  * @return {number}
  * @return {string}
  */`);
                parsesIncorrectly("noTypeParameters",
                        `/**
  * @template
  */`);
                parsesIncorrectly("trailingTypeParameterComma",
                        `/**
  * @template T,
  */`);
                parsesIncorrectly("paramWithoutName",
                        `/**
  * @param {number}
  */`);
                parsesIncorrectly("paramWithoutTypeOrName",
                        `/**
  * @param
  */`);
            });

            describe("parsesCorrectly", () => {
                parsesCorrectly("noLeadingAsterisk",
`/**
    @type {number}
  */`);


                parsesCorrectly("noType",
`/**
  * @type
  */`);


                parsesCorrectly("noReturnType",
`/**
  * @return
  */`);

                parsesCorrectly("leadingAsterisk",
`/**
  * @type {number}
  */`);

                parsesCorrectly("asteriskAfterPreamble", "/** * @type {number} */");

                parsesCorrectly("typeTag",
`/**
  * @type {number}
  */`);


                parsesCorrectly("returnTag1",
`/**
  * @return {number}
  */`);


                parsesCorrectly("returnTag2",
`/**
  * @return {number} Description text follows
  */`);


                parsesCorrectly("returnsTag1",
`/**
  * @returns {number}
  */`);


                parsesCorrectly("oneParamTag",
`/**
  * @param {number} name1
  */`);


                parsesCorrectly("twoParamTag2",
`/**
  * @param {number} name1
  * @param {number} name2
  */`);


                parsesCorrectly("paramTag1",
`/**
  * @param {number} name1 Description text follows
  */`);


                parsesCorrectly("paramTagBracketedName1",
`/**
  * @param {number} [name1] Description text follows
  */`);


                parsesCorrectly("paramTagBracketedName2",
`/**
  * @param {number} [ name1 = 1] Description text follows
  */`);


                parsesCorrectly("twoParamTagOnSameLine",
`/**
  * @param {number} name1 @param {number} name2
  */`);


                parsesCorrectly("paramTagNameThenType1",
`/**
  * @param name1 {number}
  */`);


                parsesCorrectly("paramTagNameThenType2",
`/**
  * @param name1 {number} Description
  */`);


                parsesCorrectly("templateTag",
`/**
  * @template T
  */`);


                parsesCorrectly("templateTag2",
`/**
  * @template K,V
  */`);


                parsesCorrectly("templateTag3",
`/**
  * @template K ,V
  */`);


                parsesCorrectly("templateTag4",
`/**
  * @template K, V
  */`);


                parsesCorrectly("templateTag5",
`/**
  * @template K , V
  */`);

                parsesCorrectly("templateTag6",
`/**
  * @template K , V Description of type parameters.
  */`);

                parsesCorrectly("paramWithoutType",
`/**
  * @param foo
  */`);
                parsesCorrectly("typedefTagWithChildrenTags",
`/**
  * @typedef People
  * @type {Object}
  * @property {number} age
  * @property {string} name
  */`);
            });
        });
        describe("getFirstToken", () => {
            it("gets jsdoc", () => {
                const first = ts.createSourceFile("foo.ts", "/** comment */var a = true;", ts.ScriptTarget.ES5, /*setParentNodes*/ true);
                assert.isDefined(first);
                assert.equal(first.kind, 263);
            });
        });
        describe("getLastToken", () => {
            it("gets jsdoc", () => {
                const last = ts.createSourceFile("foo.ts", "var a = true;/** comment */", ts.ScriptTarget.ES5, /*setParentNodes*/ true);
                assert.isDefined(last);
                assert.equal(last.kind, 263);
            });
        });
    });
}
