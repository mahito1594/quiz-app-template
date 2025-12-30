# Changelog

## [1.0.3](https://github.com/mahito1594/quiz-app-template/compare/v1.0.2...v1.0.3) (2025-12-30)


### Bug Fixes

* **test:** fix failed tests ([0c70c50](https://github.com/mahito1594/quiz-app-template/commit/0c70c50be56f8578a91d22cf5579137ad753fda6))

## [1.0.2](https://github.com/mahito1594/quiz-app-template/compare/v1.0.1...v1.0.2) (2025-08-23)


### Bug Fixes

* **deps:** update all non-major dependencies ([e007a23](https://github.com/mahito1594/quiz-app-template/commit/e007a239b163cee3a386e0aeaf39bdacb98b1912))
* **lint:** ignore noUnknownAtRules for TailwindCSS's at-rule ([e88143e](https://github.com/mahito1594/quiz-app-template/commit/e88143e24e4c7c00c351650eaa0c55ea00c0dff9))
* replace `回間違い` with `&times;` ([9cd8d52](https://github.com/mahito1594/quiz-app-template/commit/9cd8d52ada9800c9297436ce5061c4b2ccb2225a))

## [1.0.1](https://github.com/mahito1594/quiz-app-template/compare/v1.0.0...v1.0.1) (2025-08-15)


### Bug Fixes

* **ci:** remove config that skips github-release ([#44](https://github.com/mahito1594/quiz-app-template/issues/44)) ([9ef182b](https://github.com/mahito1594/quiz-app-template/commit/9ef182bcb605c966d12c85adf013cb6029f331aa))

## 1.0.0 (2025-08-15)


### ⚠ BREAKING CHANGES

* Initial stable release with automatic versioning and deployment automation
* **test:** drop Firefox from E2E testing target
* **test:** remove unnecessary test
* **core:** Questions now use array indices instead of explicit IDs

### Features

* **a11y:** improve accessibility for quiz answer options ([193c814](https://github.com/mahito1594/quiz-app-template/commit/193c81470b4b97a6071bcbd9aaecf70c35d6c3d1))
* **a11y:** improve accessibility for quiz answer options ([af79d05](https://github.com/mahito1594/quiz-app-template/commit/af79d05ad5bab1749420a1781ee5560f4f5d13d7))
* add automatic release management with Release-please ([26e3d19](https://github.com/mahito1594/quiz-app-template/commit/26e3d19a00141b6b2efdf74542003cc948ef776a))
* add GitHub Actions CI/CD workflow for PR checks ([99383ff](https://github.com/mahito1594/quiz-app-template/commit/99383ff0a171c9af13d648b1cbda9030d830ee03))
* automate totalQuestions calculation for improved maintainability ([37206b2](https://github.com/mahito1594/quiz-app-template/commit/37206b28f91f50d2866a0e98d1809ede6ded6ef7))
* **ci:** add commitlint ([2f518a5](https://github.com/mahito1594/quiz-app-template/commit/2f518a5b17a2d00baa36a110dd052256ab30516c))
* **ci:** add GitHub Actions CI/CD workflow for PR checks ([aac5d50](https://github.com/mahito1594/quiz-app-template/commit/aac5d50dba53f1fc3d4ea93f19a5181e2bebb04e))
* **ci:** run e2e test by using GitHub Actions ([49f3041](https://github.com/mahito1594/quiz-app-template/commit/49f30414dc2946b30236db3a52d23cdb1109e4b2))
* **core:** implement complete quiz functionality with TDD approach ([842ed0a](https://github.com/mahito1594/quiz-app-template/commit/842ed0adce02c6b031f75eeda06feed266ef0c45))
* **data:** implement YAML loading system with functional programming ([69f5295](https://github.com/mahito1594/quiz-app-template/commit/69f5295f0c86904c4c1377fb8853324bc798f291))
* **docs:** update readme ([3866a13](https://github.com/mahito1594/quiz-app-template/commit/3866a1368a8080b959e5121a7e86b2999820ab66))
* E2E テストの追加 ([bfa6ab3](https://github.com/mahito1594/quiz-app-template/commit/bfa6ab3b1670925bbff90ca345a267842c63b8cb))
* first implementation ([0a2ffcd](https://github.com/mahito1594/quiz-app-template/commit/0a2ffcd27d052b2959b742be8d2fd9927792405c))
* implement comprehensive CategoryList testing with production quality priority ([68c6bcd](https://github.com/mahito1594/quiz-app-template/commit/68c6bcd44aaf3c1187b1f4a79f1a1454059521e7))
* implement comprehensive Quiz component tests with integration approach ([cabb232](https://github.com/mahito1594/quiz-app-template/commit/cabb2324225d1bf71a716127f83e12f9ba6c1b40))
* implement type-safe data parsing with valibot and TDD ([212d063](https://github.com/mahito1594/quiz-app-template/commit/212d0639195161b58a40e4d3de5a268003e35fc1))
* improve markdown link styling with @tailwindcss/typography ([d9ddf69](https://github.com/mahito1594/quiz-app-template/commit/d9ddf69cf3822723b821fd4a58a274cda29932ac))
* initial commit ([9ffa5fc](https://github.com/mahito1594/quiz-app-template/commit/9ffa5fc0e3f49812c0d0e13d6c3bb4ef7d4d3809))
* **layout:** add max-width constraint to main content ([5878798](https://github.com/mahito1594/quiz-app-template/commit/58787989f6eed7d0c44d0d83bc91efaf6db4a96e))
* **lint:** add domain specific rules ([428f985](https://github.com/mahito1594/quiz-app-template/commit/428f9855fea19ae134b29d97806f3268a973d834))
* **test:** add e2e tests ([51cc006](https://github.com/mahito1594/quiz-app-template/commit/51cc006ee0aab3dd2f89868698aef154c6709046))
* **test:** drop Firefox from E2E testing target ([fe0923f](https://github.com/mahito1594/quiz-app-template/commit/fe0923f41333065332d2cd62224108c5e4bcc340))
* **test:** remove unnecessary test ([5ced060](https://github.com/mahito1594/quiz-app-template/commit/5ced06062ebd0645afaa43e78345a2b81bcc5e8e))
* **ui:** implement hash routing system with TailwindCSS + DaisyUI ([5780c00](https://github.com/mahito1594/quiz-app-template/commit/5780c0037c425dc9ce64ed7fd0f8da4dde4b250e))


### Bug Fixes

* **ci:** add permission to workflow ([#42](https://github.com/mahito1594/quiz-app-template/issues/42)) ([0eaf638](https://github.com/mahito1594/quiz-app-template/commit/0eaf638cade2ca01f37c5346ee95fc85e27be0c8))
* **ci:** remove unnecessary steps ([518a1cb](https://github.com/mahito1594/quiz-app-template/commit/518a1cbe5a7b043f4e5b4a384ed90d71d869710c))
* **deps:** update all non-major dependencies ([#36](https://github.com/mahito1594/quiz-app-template/issues/36)) ([838af8a](https://github.com/mahito1594/quiz-app-template/commit/838af8a67a1f86db81338a91b1f245285c71428e))
* **doc:** fix preset name ([97bf55f](https://github.com/mahito1594/quiz-app-template/commit/97bf55f3ed62a6d61a9cc00ad635262f28cb15b6))
* **doc:** fix preset name ([667f4c1](https://github.com/mahito1594/quiz-app-template/commit/667f4c189ab0242ea7d1fa8d1d0c836da1f8c82c))
* improve UI for questions which have long options ([da69687](https://github.com/mahito1594/quiz-app-template/commit/da6968726fe9ce8263cc31ba3f22221f00a0f4be))
* **quiz:** sync currentQuestionIndex with answers.length on quiz resume ([bbac317](https://github.com/mahito1594/quiz-app-template/commit/bbac3172a2bfb66038ee26fc84cb0c509f9aca3c))
* **quiz:** sync currentQuestionIndex with answers.length on quiz resume ([1c20012](https://github.com/mahito1594/quiz-app-template/commit/1c20012ede5e3d34907ff19e7da71c7af1e7470c))
* resolve text overflow issue for long answer options ([ebe3326](https://github.com/mahito1594/quiz-app-template/commit/ebe3326598f82bfaaf904fcb4e2a50e630ed571a))
* resolve user acceptance test issues and improve code quality ([76f656f](https://github.com/mahito1594/quiz-app-template/commit/76f656fb05d03dbf197b2ac008ed2fb6673a748b))
* **review:** fix error count not incrementing in review mode ([81d341a](https://github.com/mahito1594/quiz-app-template/commit/81d341a045009c08816defd3322180cd1355016a))
* **review:** resolve review list persistence after quiz retake (Issue [#31](https://github.com/mahito1594/quiz-app-template/issues/31)) ([0e20975](https://github.com/mahito1594/quiz-app-template/commit/0e20975fb8e4ef50bea9d9e404b4becd048eefee))
* **review:** show success message instead of error when no review items exist ([77daf03](https://github.com/mahito1594/quiz-app-template/commit/77daf03825de054e3b9139b340f75881cd0858ef))
* **ui:** improve icon contrast and visibility ([028bf74](https://github.com/mahito1594/quiz-app-template/commit/028bf74196cff60cf436df4ac4709f078f7eedf5))
* **ui:** improve review badge and E2E test coverage for Issue [#28](https://github.com/mahito1594/quiz-app-template/issues/28) ([12cc7bb](https://github.com/mahito1594/quiz-app-template/commit/12cc7bb2731460f2b46c51607fc1ef7562cf68bc))
* **ui:** improve review badge and E2E test coverage for Issue [#28](https://github.com/mahito1594/quiz-app-template/issues/28); close [#28](https://github.com/mahito1594/quiz-app-template/issues/28) ([6d17550](https://github.com/mahito1594/quiz-app-template/commit/6d175502de95dc3a56b0699cf8cee82a80cd937c))
* use PAT instead default token & deploy after release PR merged ([#41](https://github.com/mahito1594/quiz-app-template/issues/41)) ([4a5de83](https://github.com/mahito1594/quiz-app-template/commit/4a5de838ba85c4d63030778a2708bbc174b9668c))
* ユーザー指摘対応 ([b433782](https://github.com/mahito1594/quiz-app-template/commit/b433782037e00ff00299749e319f93d86ed442bf))
