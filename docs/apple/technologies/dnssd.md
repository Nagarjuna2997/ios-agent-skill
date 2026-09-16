# dnssd

## Context

Load this when a task names **dnssd** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/dnssd) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Discover, publish, and resolve network services on a local area or wide area network.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `dnssd`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 10.0 | — | No |
| iPadOS | 10.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.12 | — | No |
| tvOS | 10.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 3.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Reference

- [DNS Service Discovery C](https://developer.apple.com/documentation/dnssd/dns-service-discovery-c)
- [dnssd Enumerations](https://developer.apple.com/documentation/dnssd/dnssd-enumerations)
- [dnssd Functions](https://developer.apple.com/documentation/dnssd/dnssd-functions)
- [dnssd Data Types](https://developer.apple.com/documentation/dnssd/dnssd-data-types)
- [dnssd Constants](https://developer.apple.com/documentation/dnssd/dnssd-constants)

### Variables

- [kDNSServiceAAAAPolicyFallback](https://developer.apple.com/documentation/dnssd/kdnsserviceaaaapolicyfallback)
- [kDNSServiceAAAAPolicyNone](https://developer.apple.com/documentation/dnssd/kdnsserviceaaaapolicynone)
- [kDNSServiceClass_IN](https://developer.apple.com/documentation/dnssd/kdnsserviceclass_in)
- [kDNSServiceErr_AWDLTimeout](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_awdltimeout)
- [kDNSServiceErr_AlreadyRegistered](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_alreadyregistered)
- [kDNSServiceErr_BadFlags](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_badflags)
- [kDNSServiceErr_BadInterfaceIndex](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_badinterfaceindex)
- [kDNSServiceErr_BadKey](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_badkey)
- [kDNSServiceErr_BadParam](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_badparam)
- [kDNSServiceErr_BadReference](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_badreference)
- [kDNSServiceErr_BadSig](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_badsig)
- [kDNSServiceErr_BadState](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_badstate)
- [kDNSServiceErr_BadTime](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_badtime)
- [kDNSServiceErr_DefunctConnection](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_defunctconnection)
- [kDNSServiceErr_DoubleNAT](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_doublenat)
- [kDNSServiceErr_Firewall](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_firewall)
- [kDNSServiceErr_Incompatible](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_incompatible)
- [kDNSServiceErr_Invalid](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_invalid)
- [kDNSServiceErr_NATPortMappingDisabled](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_natportmappingdisabled)
- [kDNSServiceErr_NATPortMappingUnsupported](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_natportmappingunsupported)
- [kDNSServiceErr_NATTraversal](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_nattraversal)
- [kDNSServiceErr_NameConflict](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_nameconflict)
- [kDNSServiceErr_NoAuth](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_noauth)
- [kDNSServiceErr_NoError](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_noerror)
- [kDNSServiceErr_NoMemory](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_nomemory)
- [kDNSServiceErr_NoRouter](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_norouter)
- [kDNSServiceErr_NoSuchKey](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_nosuchkey)
- [kDNSServiceErr_NoSuchName](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_nosuchname)
- [kDNSServiceErr_NoSuchRecord](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_nosuchrecord)
- [kDNSServiceErr_NotInitialized](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_notinitialized)
- [kDNSServiceErr_NotPermitted](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_notpermitted)
- [kDNSServiceErr_PolicyDenied](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_policydenied)
- [kDNSServiceErr_PollingMode](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_pollingmode)
- [kDNSServiceErr_Refused](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_refused)
- [kDNSServiceErr_ServiceNotRunning](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_servicenotrunning)
- [kDNSServiceErr_StaleData](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_staledata)
- [kDNSServiceErr_Timeout](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_timeout)
- [kDNSServiceErr_Transient](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_transient)
- [kDNSServiceErr_Unknown](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_unknown)
- [kDNSServiceErr_Unsupported](https://developer.apple.com/documentation/dnssd/kdnsserviceerr_unsupported)
- [kDNSServiceFlagAnsweredFromCache](https://developer.apple.com/documentation/dnssd/kdnsserviceflagansweredfromcache)
- [kDNSServiceFlagsAdd](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsadd)
- [kDNSServiceFlagsAllowExpiredAnswers](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsallowexpiredanswers)
- [kDNSServiceFlagsAllowRemoteQuery](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsallowremotequery)
- [kDNSServiceFlagsAutoTrigger](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsautotrigger)
- [kDNSServiceFlagsBackgroundTrafficClass](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsbackgroundtrafficclass)
- [kDNSServiceFlagsBogus](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsbogus)
- [kDNSServiceFlagsBrowseDomains](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsbrowsedomains)
- [kDNSServiceFlagsDefault](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsdefault)
- [kDNSServiceFlagsEnableDNSSEC](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsenablednssec)
- [kDNSServiceFlagsExpiredAnswer](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsexpiredanswer)
- [kDNSServiceFlagsForce](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsforce)
- [kDNSServiceFlagsForceMulticast](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsforcemulticast)
- [kDNSServiceFlagsIncludeAWDL](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsincludeawdl)
- [kDNSServiceFlagsIncludeP2P](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsincludep2p)
- [kDNSServiceFlagsIndeterminate](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsindeterminate)
- [kDNSServiceFlagsInsecure](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsinsecure)
- [kDNSServiceFlagsKnownUnique](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsknownunique)
- [kDNSServiceFlagsLongLivedQuery](https://developer.apple.com/documentation/dnssd/kdnsserviceflagslonglivedquery)
- [kDNSServiceFlagsMoreComing](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsmorecoming)
- [kDNSServiceFlagsNoAutoRename](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsnoautorename)
- [kDNSServiceFlagsPrivateFive](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsprivatefive)
- [kDNSServiceFlagsPrivateFour](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsprivatefour)
- [kDNSServiceFlagsPrivateOne](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsprivateone)
- [kDNSServiceFlagsPrivateThree](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsprivatethree)
- [kDNSServiceFlagsPrivateTwo](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsprivatetwo)
- [kDNSServiceFlagsQueueRequest](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsqueuerequest)
- [kDNSServiceFlagsRegistrationDomains](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsregistrationdomains)
- [kDNSServiceFlagsReturnIntermediates](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsreturnintermediates)
- [kDNSServiceFlagsSecure](https://developer.apple.com/documentation/dnssd/kdnsserviceflagssecure)
- [kDNSServiceFlagsShareConnection](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsshareconnection)
- [kDNSServiceFlagsShared](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsshared)
- [kDNSServiceFlagsSuppressUnusable](https://developer.apple.com/documentation/dnssd/kdnsserviceflagssuppressunusable)
- [kDNSServiceFlagsThresholdFinder](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsthresholdfinder)
- [kDNSServiceFlagsThresholdOne](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsthresholdone)
- [kDNSServiceFlagsThresholdReached](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsthresholdreached)
- [kDNSServiceFlagsTimeout](https://developer.apple.com/documentation/dnssd/kdnsserviceflagstimeout)
- [kDNSServiceFlagsUnicastResponse](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsunicastresponse)
- [kDNSServiceFlagsUnique](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsunique)
- [kDNSServiceFlagsValidate](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsvalidate)
- [kDNSServiceFlagsValidateOptional](https://developer.apple.com/documentation/dnssd/kdnsserviceflagsvalidateoptional)
- [kDNSServiceFlagsWakeOnResolve](https://developer.apple.com/documentation/dnssd/kdnsserviceflagswakeonresolve)
- [kDNSServiceFlagsWakeOnlyService](https://developer.apple.com/documentation/dnssd/kdnsserviceflagswakeonlyservice)
- [kDNSServiceProtocol_IPv4](https://developer.apple.com/documentation/dnssd/kdnsserviceprotocol_ipv4)
- [kDNSServiceProtocol_IPv6](https://developer.apple.com/documentation/dnssd/kdnsserviceprotocol_ipv6)
- [kDNSServiceProtocol_TCP](https://developer.apple.com/documentation/dnssd/kdnsserviceprotocol_tcp)
- [kDNSServiceProtocol_UDP](https://developer.apple.com/documentation/dnssd/kdnsserviceprotocol_udp)
- [kDNSServiceType_A](https://developer.apple.com/documentation/dnssd/kdnsservicetype_a)
- [kDNSServiceType_A6](https://developer.apple.com/documentation/dnssd/kdnsservicetype_a6)
- [kDNSServiceType_AAAA](https://developer.apple.com/documentation/dnssd/kdnsservicetype_aaaa)
- [kDNSServiceType_AFSDB](https://developer.apple.com/documentation/dnssd/kdnsservicetype_afsdb)
- [kDNSServiceType_ANY](https://developer.apple.com/documentation/dnssd/kdnsservicetype_any)
- [kDNSServiceType_APL](https://developer.apple.com/documentation/dnssd/kdnsservicetype_apl)
- [kDNSServiceType_ATMA](https://developer.apple.com/documentation/dnssd/kdnsservicetype_atma)
- [kDNSServiceType_AXFR](https://developer.apple.com/documentation/dnssd/kdnsservicetype_axfr)
- [kDNSServiceType_CERT](https://developer.apple.com/documentation/dnssd/kdnsservicetype_cert)
- [kDNSServiceType_CNAME](https://developer.apple.com/documentation/dnssd/kdnsservicetype_cname)
- [kDNSServiceType_DHCID](https://developer.apple.com/documentation/dnssd/kdnsservicetype_dhcid)
- [kDNSServiceType_DNAME](https://developer.apple.com/documentation/dnssd/kdnsservicetype_dname)
- [kDNSServiceType_DNSKEY](https://developer.apple.com/documentation/dnssd/kdnsservicetype_dnskey)
- [kDNSServiceType_DS](https://developer.apple.com/documentation/dnssd/kdnsservicetype_ds)
- [kDNSServiceType_EID](https://developer.apple.com/documentation/dnssd/kdnsservicetype_eid)
- [kDNSServiceType_GID](https://developer.apple.com/documentation/dnssd/kdnsservicetype_gid)
- [kDNSServiceType_GPOS](https://developer.apple.com/documentation/dnssd/kdnsservicetype_gpos)
- [kDNSServiceType_HINFO](https://developer.apple.com/documentation/dnssd/kdnsservicetype_hinfo)
- [kDNSServiceType_HIP](https://developer.apple.com/documentation/dnssd/kdnsservicetype_hip)
- [kDNSServiceType_HTTPS](https://developer.apple.com/documentation/dnssd/kdnsservicetype_https)
- [kDNSServiceType_IPSECKEY](https://developer.apple.com/documentation/dnssd/kdnsservicetype_ipseckey)
- [kDNSServiceType_ISDN](https://developer.apple.com/documentation/dnssd/kdnsservicetype_isdn)
- [kDNSServiceType_IXFR](https://developer.apple.com/documentation/dnssd/kdnsservicetype_ixfr)
- [kDNSServiceType_KEY](https://developer.apple.com/documentation/dnssd/kdnsservicetype_key)
- [kDNSServiceType_KX](https://developer.apple.com/documentation/dnssd/kdnsservicetype_kx)
- [kDNSServiceType_LOC](https://developer.apple.com/documentation/dnssd/kdnsservicetype_loc)
- [kDNSServiceType_MAILA](https://developer.apple.com/documentation/dnssd/kdnsservicetype_maila)
- [kDNSServiceType_MAILB](https://developer.apple.com/documentation/dnssd/kdnsservicetype_mailb)
- [kDNSServiceType_MB](https://developer.apple.com/documentation/dnssd/kdnsservicetype_mb)
- [kDNSServiceType_MD](https://developer.apple.com/documentation/dnssd/kdnsservicetype_md)
- [kDNSServiceType_MF](https://developer.apple.com/documentation/dnssd/kdnsservicetype_mf)
- [kDNSServiceType_MG](https://developer.apple.com/documentation/dnssd/kdnsservicetype_mg)
- [kDNSServiceType_MINFO](https://developer.apple.com/documentation/dnssd/kdnsservicetype_minfo)
- [kDNSServiceType_MR](https://developer.apple.com/documentation/dnssd/kdnsservicetype_mr)
- [kDNSServiceType_MX](https://developer.apple.com/documentation/dnssd/kdnsservicetype_mx)
- [kDNSServiceType_NAPTR](https://developer.apple.com/documentation/dnssd/kdnsservicetype_naptr)
- [kDNSServiceType_NIMLOC](https://developer.apple.com/documentation/dnssd/kdnsservicetype_nimloc)
- [kDNSServiceType_NS](https://developer.apple.com/documentation/dnssd/kdnsservicetype_ns)
- [kDNSServiceType_NSAP](https://developer.apple.com/documentation/dnssd/kdnsservicetype_nsap)
- [kDNSServiceType_NSAP_PTR](https://developer.apple.com/documentation/dnssd/kdnsservicetype_nsap_ptr)
- [kDNSServiceType_NSEC](https://developer.apple.com/documentation/dnssd/kdnsservicetype_nsec)
- [kDNSServiceType_NSEC3](https://developer.apple.com/documentation/dnssd/kdnsservicetype_nsec3)
- [kDNSServiceType_NSEC3PARAM](https://developer.apple.com/documentation/dnssd/kdnsservicetype_nsec3param)
- [kDNSServiceType_NULL](https://developer.apple.com/documentation/dnssd/kdnsservicetype_null)
- [kDNSServiceType_NXT](https://developer.apple.com/documentation/dnssd/kdnsservicetype_nxt)
- [kDNSServiceType_OPT](https://developer.apple.com/documentation/dnssd/kdnsservicetype_opt)
- [kDNSServiceType_PTR](https://developer.apple.com/documentation/dnssd/kdnsservicetype_ptr)
- [kDNSServiceType_PX](https://developer.apple.com/documentation/dnssd/kdnsservicetype_px)
- [kDNSServiceType_RP](https://developer.apple.com/documentation/dnssd/kdnsservicetype_rp)
- [kDNSServiceType_RRSIG](https://developer.apple.com/documentation/dnssd/kdnsservicetype_rrsig)
- [kDNSServiceType_RT](https://developer.apple.com/documentation/dnssd/kdnsservicetype_rt)
- [kDNSServiceType_SIG](https://developer.apple.com/documentation/dnssd/kdnsservicetype_sig)
- [kDNSServiceType_SINK](https://developer.apple.com/documentation/dnssd/kdnsservicetype_sink)
- [kDNSServiceType_SOA](https://developer.apple.com/documentation/dnssd/kdnsservicetype_soa)
- [kDNSServiceType_SPF](https://developer.apple.com/documentation/dnssd/kdnsservicetype_spf)
- [kDNSServiceType_SRV](https://developer.apple.com/documentation/dnssd/kdnsservicetype_srv)
- [kDNSServiceType_SSHFP](https://developer.apple.com/documentation/dnssd/kdnsservicetype_sshfp)
- [kDNSServiceType_SVCB](https://developer.apple.com/documentation/dnssd/kdnsservicetype_svcb)
- [kDNSServiceType_TKEY](https://developer.apple.com/documentation/dnssd/kdnsservicetype_tkey)
- [kDNSServiceType_TSIG](https://developer.apple.com/documentation/dnssd/kdnsservicetype_tsig)
- [kDNSServiceType_TXT](https://developer.apple.com/documentation/dnssd/kdnsservicetype_txt)
- [kDNSServiceType_UID](https://developer.apple.com/documentation/dnssd/kdnsservicetype_uid)
- [kDNSServiceType_UINFO](https://developer.apple.com/documentation/dnssd/kdnsservicetype_uinfo)
- [kDNSServiceType_UNSPEC](https://developer.apple.com/documentation/dnssd/kdnsservicetype_unspec)
- [kDNSServiceType_WKS](https://developer.apple.com/documentation/dnssd/kdnsservicetype_wks)
- [kDNSServiceType_X25](https://developer.apple.com/documentation/dnssd/kdnsservicetype_x25)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
