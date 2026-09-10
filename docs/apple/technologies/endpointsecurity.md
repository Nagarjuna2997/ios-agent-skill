# Endpoint Security

## Context

Load this when a task names **Endpoint Security** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/endpointsecurity) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Develop system extensions that enhance user security.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Endpoint Security`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.15 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Event Monitoring

- [Client](https://developer.apple.com/documentation/endpointsecurity/client)
- [Message](https://developer.apple.com/documentation/endpointsecurity/message)
- [Event Types](https://developer.apple.com/documentation/endpointsecurity/event-types)

### Entitlements

- [com.apple.developer.endpoint-security.client](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.endpoint-security.client)

### Reference

- [EndpointSecurity Constants](https://developer.apple.com/documentation/endpointsecurity/endpointsecurity-constants)
- [EndpointSecurity Data Types](https://developer.apple.com/documentation/endpointsecurity/endpointsecurity-data-types)
- [EndpointSecurity Functions](https://developer.apple.com/documentation/endpointsecurity/endpointsecurity-functions)
- [EndpointSecurity Structures](https://developer.apple.com/documentation/endpointsecurity/endpointsecurity-structures)
- [EndpointSecurity Enumerations](https://developer.apple.com/documentation/endpointsecurity/endpointsecurity-enumerations)

### Structures

- [es_bootstrap_target_type_t](https://developer.apple.com/documentation/endpointsecurity/es_bootstrap_target_type_t)
- [es_cs_validation_category_t](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_t)
- [es_deadline_miss_mode_t](https://developer.apple.com/documentation/endpointsecurity/es_deadline_miss_mode_t)
- [es_event_bootstrap_check_in_t](https://developer.apple.com/documentation/endpointsecurity/es_event_bootstrap_check_in_t)
- [es_event_bootstrap_look_up_t](https://developer.apple.com/documentation/endpointsecurity/es_event_bootstrap_look_up_t)
- [es_event_tcc_modify_t](https://developer.apple.com/documentation/endpointsecurity/es_event_tcc_modify_t)
- [es_lightweight_code_requirement_t](https://developer.apple.com/documentation/endpointsecurity/es_lightweight_code_requirement_t)
- [es_tcc_authorization_reason_t](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_t)
- [es_tcc_authorization_right_t](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_right_t)
- [es_tcc_event_type_t](https://developer.apple.com/documentation/endpointsecurity/es_tcc_event_type_t)
- [es_tcc_identity_type_t](https://developer.apple.com/documentation/endpointsecurity/es_tcc_identity_type_t)

### Variables

- [ES_BOOTSTRAP_TARGET_TYPE_JOB](https://developer.apple.com/documentation/endpointsecurity/es_bootstrap_target_type_job)
- [ES_BOOTSTRAP_TARGET_TYPE_PROCESS](https://developer.apple.com/documentation/endpointsecurity/es_bootstrap_target_type_process)
- [ES_CS_VALIDATION_CATEGORY_APP_STORE](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_app_store)
- [ES_CS_VALIDATION_CATEGORY_DEVELOPER_ID](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_developer_id)
- [ES_CS_VALIDATION_CATEGORY_DEVELOPMENT](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_development)
- [ES_CS_VALIDATION_CATEGORY_ENTERPRISE](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_enterprise)
- [ES_CS_VALIDATION_CATEGORY_INVALID](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_invalid)
- [ES_CS_VALIDATION_CATEGORY_LOCAL_SIGNING](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_local_signing)
- [ES_CS_VALIDATION_CATEGORY_NONE](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_none)
- [ES_CS_VALIDATION_CATEGORY_OOPJIT](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_oopjit)
- [ES_CS_VALIDATION_CATEGORY_PLATFORM](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_platform)
- [ES_CS_VALIDATION_CATEGORY_ROSETTA](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_rosetta)
- [ES_CS_VALIDATION_CATEGORY_TESTFLIGHT](https://developer.apple.com/documentation/endpointsecurity/es_cs_validation_category_testflight)
- [ES_DEADLINE_MISS_MODE_FAIL_CLOSED](https://developer.apple.com/documentation/endpointsecurity/es_deadline_miss_mode_fail_closed)
- [ES_DEADLINE_MISS_MODE_FAIL_OPEN](https://developer.apple.com/documentation/endpointsecurity/es_deadline_miss_mode_fail_open)
- [ES_DEADLINE_MISS_MODE_KILL](https://developer.apple.com/documentation/endpointsecurity/es_deadline_miss_mode_kill)
- [ES_EVENT_TYPE_AUTH_BOOTSTRAP_CHECK_IN](https://developer.apple.com/documentation/endpointsecurity/es_event_type_auth_bootstrap_check_in)
- [ES_EVENT_TYPE_AUTH_BOOTSTRAP_LOOK_UP](https://developer.apple.com/documentation/endpointsecurity/es_event_type_auth_bootstrap_look_up)
- [ES_EVENT_TYPE_AUTH_XPC_CONNECT](https://developer.apple.com/documentation/endpointsecurity/es_event_type_auth_xpc_connect)
- [ES_EVENT_TYPE_NOTIFY_BOOTSTRAP_CHECK_IN](https://developer.apple.com/documentation/endpointsecurity/es_event_type_notify_bootstrap_check_in)
- [ES_EVENT_TYPE_NOTIFY_BOOTSTRAP_LOOK_UP](https://developer.apple.com/documentation/endpointsecurity/es_event_type_notify_bootstrap_look_up)
- [ES_EVENT_TYPE_NOTIFY_TCC_MODIFY](https://developer.apple.com/documentation/endpointsecurity/es_event_type_notify_tcc_modify)
- [ES_EVENT_TYPE_RESERVED_0](https://developer.apple.com/documentation/endpointsecurity/es_event_type_reserved_0)
- [ES_EVENT_TYPE_RESERVED_1](https://developer.apple.com/documentation/endpointsecurity/es_event_type_reserved_1)
- [ES_EVENT_TYPE_RESERVED_2](https://developer.apple.com/documentation/endpointsecurity/es_event_type_reserved_2)
- [ES_EVENT_TYPE_RESERVED_3](https://developer.apple.com/documentation/endpointsecurity/es_event_type_reserved_3)
- [ES_EVENT_TYPE_RESERVED_4](https://developer.apple.com/documentation/endpointsecurity/es_event_type_reserved_4)
- [ES_EVENT_TYPE_RESERVED_5](https://developer.apple.com/documentation/endpointsecurity/es_event_type_reserved_5)
- [ES_EVENT_TYPE_RESERVED_6](https://developer.apple.com/documentation/endpointsecurity/es_event_type_reserved_6)
- [ES_EVENT_TYPE_RESERVED_7](https://developer.apple.com/documentation/endpointsecurity/es_event_type_reserved_7)
- [ES_EVENT_TYPE_RESERVED_8](https://developer.apple.com/documentation/endpointsecurity/es_event_type_reserved_8)
- [ES_TCC_AUTHORIZATION_REASON_APP_TYPE_POLICY](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_app_type_policy)
- [ES_TCC_AUTHORIZATION_REASON_ENTITLED](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_entitled)
- [ES_TCC_AUTHORIZATION_REASON_ERROR](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_error)
- [ES_TCC_AUTHORIZATION_REASON_MDM_POLICY](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_mdm_policy)
- [ES_TCC_AUTHORIZATION_REASON_MISSING_USAGE_STRING](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_missing_usage_string)
- [ES_TCC_AUTHORIZATION_REASON_NONE](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_none)
- [ES_TCC_AUTHORIZATION_REASON_PREFLIGHT_UNKNOWN](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_preflight_unknown)
- [ES_TCC_AUTHORIZATION_REASON_PROMPT_CANCEL](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_prompt_cancel)
- [ES_TCC_AUTHORIZATION_REASON_PROMPT_TIMEOUT](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_prompt_timeout)
- [ES_TCC_AUTHORIZATION_REASON_SERVICE_OVERRIDE_POLICY](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_service_override_policy)
- [ES_TCC_AUTHORIZATION_REASON_SERVICE_POLICY](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_service_policy)
- [ES_TCC_AUTHORIZATION_REASON_SYSTEM_SET](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_system_set)
- [ES_TCC_AUTHORIZATION_REASON_USER_CONSENT](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_user_consent)
- [ES_TCC_AUTHORIZATION_REASON_USER_SET](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_reason_user_set)
- [ES_TCC_AUTHORIZATION_RIGHT_ADD_MODIFY_ADDED](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_right_add_modify_added)
- [ES_TCC_AUTHORIZATION_RIGHT_ALLOWED](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_right_allowed)
- [ES_TCC_AUTHORIZATION_RIGHT_DENIED](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_right_denied)
- [ES_TCC_AUTHORIZATION_RIGHT_LEARN_MORE](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_right_learn_more)
- [ES_TCC_AUTHORIZATION_RIGHT_LIMITED](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_right_limited)
- [ES_TCC_AUTHORIZATION_RIGHT_SESSION_PID](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_right_session_pid)
- [ES_TCC_AUTHORIZATION_RIGHT_UNKNOWN](https://developer.apple.com/documentation/endpointsecurity/es_tcc_authorization_right_unknown)
- [ES_TCC_EVENT_TYPE_CREATE](https://developer.apple.com/documentation/endpointsecurity/es_tcc_event_type_create)
- [ES_TCC_EVENT_TYPE_DELETE](https://developer.apple.com/documentation/endpointsecurity/es_tcc_event_type_delete)
- [ES_TCC_EVENT_TYPE_MODIFY](https://developer.apple.com/documentation/endpointsecurity/es_tcc_event_type_modify)
- [ES_TCC_EVENT_TYPE_UNKNOWN](https://developer.apple.com/documentation/endpointsecurity/es_tcc_event_type_unknown)
- [ES_TCC_IDENTITY_TYPE_BUNDLE_ID](https://developer.apple.com/documentation/endpointsecurity/es_tcc_identity_type_bundle_id)
- [ES_TCC_IDENTITY_TYPE_EXECUTABLE_PATH](https://developer.apple.com/documentation/endpointsecurity/es_tcc_identity_type_executable_path)
- [ES_TCC_IDENTITY_TYPE_FILE_PROVIDER_DOMAIN_ID](https://developer.apple.com/documentation/endpointsecurity/es_tcc_identity_type_file_provider_domain_id)
- [ES_TCC_IDENTITY_TYPE_POLICY_ID](https://developer.apple.com/documentation/endpointsecurity/es_tcc_identity_type_policy_id)

### Functions

- [es_exec_entitlements(_:)](https://developer.apple.com/documentation/endpointsecurity/es_exec_entitlements(_:))
- [es_get_deadline_max_milliseconds(_:_:_:)](https://developer.apple.com/documentation/endpointsecurity/es_get_deadline_max_milliseconds(_:_:_:))
- [es_get_deadline_min_milliseconds(_:_:_:)](https://developer.apple.com/documentation/endpointsecurity/es_get_deadline_min_milliseconds(_:_:_:))
- [es_get_deadline_miss_mode(_:_:)](https://developer.apple.com/documentation/endpointsecurity/es_get_deadline_miss_mode(_:_:))
- [es_new_descendants_client(_:_:)](https://developer.apple.com/documentation/endpointsecurity/es_new_descendants_client(_:_:))
- [es_set_deadline_max_milliseconds(_:_:_:_:)](https://developer.apple.com/documentation/endpointsecurity/es_set_deadline_max_milliseconds(_:_:_:_:))
- [es_set_deadline_min_milliseconds(_:_:_:_:)](https://developer.apple.com/documentation/endpointsecurity/es_set_deadline_min_milliseconds(_:_:_:_:))
- [es_set_deadline_miss_mode(_:_:)](https://developer.apple.com/documentation/endpointsecurity/es_set_deadline_miss_mode(_:_:))
- [es_sync_client(_:_:)](https://developer.apple.com/documentation/endpointsecurity/es_sync_client(_:_:))

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
