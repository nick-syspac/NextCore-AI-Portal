# [1.1.0](https://github.com/nick-syspac/NextCore-AI-Portal/compare/v1.0.0...v1.1.0) (2025-11-01)

### Features

- add scripts for local development and production server management ([367c765](https://github.com/nick-syspac/NextCore-AI-Portal/commit/367c765cb3732b2801439c311f982b5751983ef6))

# 1.0.0 (2025-11-01)

### Bug Fixes

- filter out 'Units of Competency' section from TAS display ([73bb57f](https://github.com/nick-syspac/NextCore-AI-Portal/commit/73bb57f6600506d50d974f4b771b8668bb47497c))

### Features

- Add Adaptive Learning Pathway feature with personalized recommendations ([bc533dc](https://github.com/nick-syspac/NextCore-AI-Portal/commit/bc533dc925534175d157e23066eaa45064540605))
- add AI model selection for TAS generation with default to GPT-4o ([614b5a9](https://github.com/nick-syspac/NextCore-AI-Portal/commit/614b5a923d09b75190da61b03635af59d5b8002f))
- add competency gap finder module to control plane and web portal ([fcdaef8](https://github.com/nick-syspac/NextCore-AI-Portal/commit/fcdaef82b2a095ebef24638e1c3b7d8ddfedbfeb))
- Add Continuous Improvement module to control plane and web portal ([0474833](https://github.com/nick-syspac/NextCore-AI-Portal/commit/0474833054b1003e49cbc407b50b73fd9b5e2034))
- Add Continuous Improvement Register (CIR) functionality ([2cd7436](https://github.com/nick-syspac/NextCore-AI-Portal/commit/2cd7436d6cc06823c8e79a09a6864b30da4fc927))
- Add Email/Message Assistant module with dashboard integration and UI components ([b1358b4](https://github.com/nick-syspac/NextCore-AI-Portal/commit/b1358b46d3fcef08b62e959a4fd2fab947ab47d2))
- add engagement heatmap feature to tenant dashboard ([8c2ff08](https://github.com/nick-syspac/NextCore-AI-Portal/commit/8c2ff085951213a05e4d467705f3018dc1e2d9d5))
- add funding eligibility checker to tenant dashboard and implement eligibility check page ([6d7a752](https://github.com/nick-syspac/NextCore-AI-Portal/commit/6d7a7528aa93deffec73a71bc83566201b87d593))
- Add Integrations and TAS Generator sections to Tenant Dashboard ([b962985](https://github.com/nick-syspac/NextCore-AI-Portal/commit/b9629855c92bfe42616e56fd61763f986e9eb48e))
- add LLN Predictor feature to the dashboard with navigation and description ([92c997c](https://github.com/nick-syspac/NextCore-AI-Portal/commit/92c997cc1c1042fb5e47979be7071a35ed19654b))
- Add Micro-Credential management functionality ([b4deb5e](https://github.com/nick-syspac/NextCore-AI-Portal/commit/b4deb5ead160f2552803ffafd6613eb50824cfac))
- Add Moderation Tool with session management, outlier detection, and bias scoring ([439b4d1](https://github.com/nick-syspac/NextCore-AI-Portal/commit/439b4d14d77a2fc596f59fb14ee43020b8dce8ee))
- Add qualification selection and unit loading functionality ([70508ae](https://github.com/nick-syspac/NextCore-AI-Portal/commit/70508aed392ed366117321d945967a9676d2afc4))
- Add Rubric Generator functionality with NLP summarization and taxonomy tagging ([f16fd9a](https://github.com/nick-syspac/NextCore-AI-Portal/commit/f16fd9a03ba28042f810770f06b885ec93f8e4f4))
- add semantic release dependencies for automated versioning and changelog generation ([8bbe334](https://github.com/nick-syspac/NextCore-AI-Portal/commit/8bbe334e542a8f4ca618ce48a4b1c355aedc2d68))
- Add usage statistics components for tenant dashboard ([2ad424a](https://github.com/nick-syspac/NextCore-AI-Portal/commit/2ad424aa90818b7ab0a3d745b02ed4073e314fe4))
- **audit-assistant:** integrate audit assistant module into control plane and web portal ([5fdf678](https://github.com/nick-syspac/NextCore-AI-Portal/commit/5fdf678d836e8db7aef231fdb8aea832629af3c3))
- **audit:** refactor Audit model to control timestamp and hash calculation ([a21f48b](https://github.com/nick-syspac/NextCore-AI-Portal/commit/a21f48b5cf082d704b2dfffec51da35fc119864e))
- **authenticity-check:** add authenticity check functionality with views, serializers, and URLs ([5def95d](https://github.com/nick-syspac/NextCore-AI-Portal/commit/5def95d13f29947f749c7eaa4b1de33cd73bc08f))
- **billing:** Implement Stripe payment method integration with UI enhancements ([44395fa](https://github.com/nick-syspac/NextCore-AI-Portal/commit/44395fae01a46c100efbf946e5d9087dff34c0d9))
- enhance Platform Management section with new UI components and description ([01fbab7](https://github.com/nick-syspac/NextCore-AI-Portal/commit/01fbab79f76a6d3e6d08d8e6d02f28121342f52c))
- enhance Tenant Dashboard with new features including EduAI Compliance Suite, TAS Generator, Policy Comparator, Audit Assistant, CI Register, and Funding Eligibility Checker ([c2e3e4e](https://github.com/nick-syspac/NextCore-AI-Portal/commit/c2e3e4e92974c1be139ae29d03b0d755d3073f85))
- **evidence-mapper:** add Evidence Mapper functionality with CRUD operations, text extraction, tagging, and embedding search ([0f56b4a](https://github.com/nick-syspac/NextCore-AI-Portal/commit/0f56b4a903a9a98dc479c91efbc70cd67ed4f24e))
- Implement Auto-Marker feature with API endpoints and frontend integration ([70594a3](https://github.com/nick-syspac/NextCore-AI-Portal/commit/70594a30436bb4fbe30d8493f189038f386ddbe4))
- Implement Evidence and Snapshot Service for Course TAS management ([3de21be](https://github.com/nick-syspac/NextCore-AI-Portal/commit/3de21bec8aca3219cee84fc3d89f8588fafbaf9d))
- Implement funding eligibility system with Celery tasks and extended API endpoints ([6a26ace](https://github.com/nick-syspac/NextCore-AI-Portal/commit/6a26acefb3b2eaa51f398c8fe6cbbffd64545ac5))
- Implement networking module with VPC, subnets, NAT gateways, and security groups ([52afa50](https://github.com/nick-syspac/NextCore-AI-Portal/commit/52afa509d109d6af4f7a5cf9e78bbceb627b1b62))
- Implement TAS document management features including loading, editing, and deleting documents ([cc26742](https://github.com/nick-syspac/NextCore-AI-Portal/commit/cc267426cf6121d4a121eb259839fc4c241a5c47))
- Initial commit of NextCore AI Cloud web portal ([5da00e4](https://github.com/nick-syspac/NextCore-AI-Portal/commit/5da00e41a0feed9e916a24b1b3b55e834f936a6e))
- Initialize RTO SaaS Monorepo with Django, FastAPI, and Next.js ([19fcdbe](https://github.com/nick-syspac/NextCore-AI-Portal/commit/19fcdbe31d0f16ed4ee043ef2437e31604cd017c))
- integrate Rich Text Editor and enhance TAS page ([1589d23](https://github.com/nick-syspac/NextCore-AI-Portal/commit/1589d23e4ec1916e67a4654d07ecde7ea40ecbb1))
- **integrations:** add new connectors for ReadyTech JR, VETtrak, eSkilled, CloudAssess, Coursebox, Moodle, D2L Brightspace, QuickBooks, Sage Intacct, and Stripe ([2d9e444](https://github.com/nick-syspac/NextCore-AI-Portal/commit/2d9e444b541f5e00d16f2af9b0f69fe3f8e244f9))
- Update funding eligibility views and API integration ([ca05e2a](https://github.com/nick-syspac/NextCore-AI-Portal/commit/ca05e2a734c2bc61e4d2693eca33c0c5924dbfd2))
- update TAS template management with new modals and API integration ([9ffd936](https://github.com/nick-syspac/NextCore-AI-Portal/commit/9ffd9369e21db13189ccf1819b71de9b2322322a))
