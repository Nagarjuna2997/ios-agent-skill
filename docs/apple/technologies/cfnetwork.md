# CFNetwork

## Context

Load this when a task names **CFNetwork** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/cfnetwork) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Access network services and handle changes in network configurations. Build on abstractions of network protocols to simplify tasks such as working with BSD sockets, administering …

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `CFNetwork`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | — | No |
| iPadOS | 2.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.8 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Errors

- [CFNetworkErrors](https://developer.apple.com/documentation/cfnetwork/cfnetworkerrors)
- [Error Dictionary Keys](https://developer.apple.com/documentation/cfnetwork/error-dictionary-keys)
- [Error Domains](https://developer.apple.com/documentation/cfnetwork/error-domains)

### Hosts

- [CFHost](https://developer.apple.com/documentation/cfnetwork/cfhost)
- [CFHostInfoType](https://developer.apple.com/documentation/cfnetwork/cfhostinfotype)
- [CFHostClientContext](https://developer.apple.com/documentation/cfnetwork/cfhostclientcontext)
- [CFHostCancelInfoResolution(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhostcancelinforesolution(_:_:)) — deprecated
- [CFHostCreateCopy(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhostcreatecopy(_:_:)) — deprecated
- [CFHostCreateWithAddress(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhostcreatewithaddress(_:_:)) — deprecated
- [CFHostCreateWithName(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhostcreatewithname(_:_:)) — deprecated
- [CFHostGetAddressing(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhostgetaddressing(_:_:)) — deprecated
- [CFHostGetNames(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhostgetnames(_:_:)) — deprecated
- [CFHostGetReachability(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhostgetreachability(_:_:)) — deprecated
- [CFHostGetTypeID()](https://developer.apple.com/documentation/cfnetwork/cfhostgettypeid()) — deprecated
- [CFHostScheduleWithRunLoop(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhostschedulewithrunloop(_:_:_:)) — deprecated
- [CFHostSetClient(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhostsetclient(_:_:_:)) — deprecated
- [CFHostStartInfoResolution(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhoststartinforesolution(_:_:_:)) — deprecated
- [CFHostUnscheduleFromRunLoop(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhostunschedulefromrunloop(_:_:_:)) — deprecated

### Global Proxy Configuration

- [CFNetworkCopyProxiesForURL(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetworkcopyproxiesforurl(_:_:))
- [CFNetworkCopyProxiesForAutoConfigurationScript(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetworkcopyproxiesforautoconfigurationscript(_:_:_:))
- [CFNetworkExecuteProxyAutoConfigurationScript(_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetworkexecuteproxyautoconfigurationscript(_:_:_:_:))
- [CFNetworkExecuteProxyAutoConfigurationURL(_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetworkexecuteproxyautoconfigurationurl(_:_:_:_:))
- [CFNetworkCopySystemProxySettings()](https://developer.apple.com/documentation/cfnetwork/cfnetworkcopysystemproxysettings())
- [CFProxyAutoConfigurationResultCallback](https://developer.apple.com/documentation/cfnetwork/cfproxyautoconfigurationresultcallback)
- [Property Keys](https://developer.apple.com/documentation/cfnetwork/property-keys)
- [Proxy Types](https://developer.apple.com/documentation/cfnetwork/proxy-types)
- [Global Proxy Settings Constants](https://developer.apple.com/documentation/cfnetwork/global-proxy-settings-constants)

### HTTP Authentication

- [CFHTTPAuthentication](https://developer.apple.com/documentation/cfnetwork/cfhttpauthentication)
- [CFHTTPAuthenticationAppliesToRequest(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpauthenticationappliestorequest(_:_:))
- [CFHTTPAuthenticationCopyDomains(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpauthenticationcopydomains(_:))
- [CFHTTPAuthenticationCopyMethod(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpauthenticationcopymethod(_:))
- [CFHTTPAuthenticationCopyRealm(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpauthenticationcopyrealm(_:))
- [CFHTTPAuthenticationCreateFromResponse(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpauthenticationcreatefromresponse(_:_:))
- [CFHTTPAuthenticationGetTypeID()](https://developer.apple.com/documentation/cfnetwork/cfhttpauthenticationgettypeid())
- [CFHTTPAuthenticationIsValid(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpauthenticationisvalid(_:_:))
- [CFHTTPAuthenticationRequiresAccountDomain(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpauthenticationrequiresaccountdomain(_:))
- [CFHTTPAuthenticationRequiresOrderedRequests(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpauthenticationrequiresorderedrequests(_:))
- [CFHTTPAuthenticationRequiresUserNameAndPassword(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpauthenticationrequiresusernameandpassword(_:))
- [kCFHTTPAuthenticationAccountDomain](https://developer.apple.com/documentation/cfnetwork/kcfhttpauthenticationaccountdomain)
- [kCFHTTPAuthenticationPassword](https://developer.apple.com/documentation/cfnetwork/kcfhttpauthenticationpassword)
- [kCFHTTPAuthenticationSchemeBasic](https://developer.apple.com/documentation/cfnetwork/kcfhttpauthenticationschemebasic)
- [kCFHTTPAuthenticationSchemeDigest](https://developer.apple.com/documentation/cfnetwork/kcfhttpauthenticationschemedigest)
- [kCFHTTPAuthenticationSchemeKerberos](https://developer.apple.com/documentation/cfnetwork/kcfhttpauthenticationschemekerberos)
- [kCFHTTPAuthenticationSchemeNTLM](https://developer.apple.com/documentation/cfnetwork/kcfhttpauthenticationschementlm)
- [kCFHTTPAuthenticationSchemeNegotiate](https://developer.apple.com/documentation/cfnetwork/kcfhttpauthenticationschemenegotiate)
- [kCFHTTPAuthenticationSchemeNegotiate2](https://developer.apple.com/documentation/cfnetwork/kcfhttpauthenticationschemenegotiate2)
- [kCFHTTPAuthenticationSchemeXMobileMeAuthToken](https://developer.apple.com/documentation/cfnetwork/kcfhttpauthenticationschemexmobilemeauthtoken)
- [kCFHTTPAuthenticationUsername](https://developer.apple.com/documentation/cfnetwork/kcfhttpauthenticationusername)

### HTTP Messages

- [CFHTTPMessage](https://developer.apple.com/documentation/cfnetwork/cfhttpmessage)
- [CFHTTPMessageAddAuthentication(_:_:_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessageaddauthentication(_:_:_:_:_:_:))
- [CFHTTPMessageAppendBytes(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessageappendbytes(_:_:_:))
- [CFHTTPMessageApplyCredentialDictionary(_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessageapplycredentialdictionary(_:_:_:_:))
- [CFHTTPMessageApplyCredentials(_:_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessageapplycredentials(_:_:_:_:_:))
- [CFHTTPMessageCopyAllHeaderFields(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecopyallheaderfields(_:))
- [CFHTTPMessageCopyBody(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecopybody(_:))
- [CFHTTPMessageCopyHeaderFieldValue(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecopyheaderfieldvalue(_:_:))
- [CFHTTPMessageCopyRequestMethod(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecopyrequestmethod(_:))
- [CFHTTPMessageCopyRequestURL(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecopyrequesturl(_:))
- [CFHTTPMessageCopyResponseStatusLine(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecopyresponsestatusline(_:))
- [CFHTTPMessageCopySerializedMessage(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecopyserializedmessage(_:))
- [CFHTTPMessageCopyVersion(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecopyversion(_:))
- [CFHTTPMessageCreateCopy(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecreatecopy(_:_:))
- [CFHTTPMessageCreateEmpty(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecreateempty(_:_:))
- [CFHTTPMessageCreateRequest(_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecreaterequest(_:_:_:_:))
- [CFHTTPMessageCreateResponse(_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagecreateresponse(_:_:_:_:))
- [CFHTTPMessageGetResponseStatusCode(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagegetresponsestatuscode(_:))
- [CFHTTPMessageGetTypeID()](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagegettypeid())
- [CFHTTPMessageIsHeaderComplete(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessageisheadercomplete(_:))
- [CFHTTPMessageIsRequest(_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessageisrequest(_:))
- [CFHTTPMessageSetBody(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagesetbody(_:_:))
- [CFHTTPMessageSetHeaderFieldValue(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfhttpmessagesetheaderfieldvalue(_:_:_:))
- [kCFHTTPVersion1_0](https://developer.apple.com/documentation/cfnetwork/kcfhttpversion1_0)
- [kCFHTTPVersion1_1](https://developer.apple.com/documentation/cfnetwork/kcfhttpversion1_1)
- [kCFHTTPVersion2_0](https://developer.apple.com/documentation/cfnetwork/kcfhttpversion2_0)

### FTP

- [CFFTPCreateParsedResourceListing(_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfftpcreateparsedresourcelisting(_:_:_:_:)) — deprecated
- [kCFFTPResourceGroup](https://developer.apple.com/documentation/cfnetwork/kcfftpresourcegroup) — deprecated
- [kCFFTPResourceLink](https://developer.apple.com/documentation/cfnetwork/kcfftpresourcelink) — deprecated
- [kCFFTPResourceModDate](https://developer.apple.com/documentation/cfnetwork/kcfftpresourcemoddate) — deprecated
- [kCFFTPResourceMode](https://developer.apple.com/documentation/cfnetwork/kcfftpresourcemode) — deprecated
- [kCFFTPResourceName](https://developer.apple.com/documentation/cfnetwork/kcfftpresourcename) — deprecated
- [kCFFTPResourceOwner](https://developer.apple.com/documentation/cfnetwork/kcfftpresourceowner) — deprecated
- [kCFFTPResourceSize](https://developer.apple.com/documentation/cfnetwork/kcfftpresourcesize) — deprecated
- [kCFFTPResourceType](https://developer.apple.com/documentation/cfnetwork/kcfftpresourcetype) — deprecated

### Network Diagnostics

- [CFNetDiagnostic](https://developer.apple.com/documentation/cfnetwork/cfnetdiagnostic)
- [CFNetDiagnosticStatusValues](https://developer.apple.com/documentation/cfnetwork/cfnetdiagnosticstatusvalues) — deprecated
- [CFNetDiagnosticCopyNetworkStatusPassively(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetdiagnosticcopynetworkstatuspassively(_:_:)) — deprecated
- [CFNetDiagnosticCreateWithStreams(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetdiagnosticcreatewithstreams(_:_:_:)) — deprecated
- [CFNetDiagnosticCreateWithURL(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetdiagnosticcreatewithurl(_:_:)) — deprecated
- [CFNetDiagnosticDiagnoseProblemInteractively(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetdiagnosticdiagnoseprobleminteractively(_:)) — deprecated
- [CFNetDiagnosticSetName(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetdiagnosticsetname(_:_:)) — deprecated

### Network Services

- [CFNetService](https://developer.apple.com/documentation/cfnetwork/cfnetservice)
- [CFNetServiceBrowser](https://developer.apple.com/documentation/cfnetwork/cfnetservicebrowser)
- [CFNetServiceBrowserFlags](https://developer.apple.com/documentation/cfnetwork/cfnetservicebrowserflags)
- [CFNetServiceMonitor](https://developer.apple.com/documentation/cfnetwork/cfnetservicemonitor)
- [CFNetServiceMonitorType](https://developer.apple.com/documentation/cfnetwork/cfnetservicemonitortype)
- [CFNetServiceClientContext](https://developer.apple.com/documentation/cfnetwork/cfnetserviceclientcontext)
- [CFNetServiceRegisterFlags](https://developer.apple.com/documentation/cfnetwork/cfnetserviceregisterflags)
- [CFNetServicesError](https://developer.apple.com/documentation/cfnetwork/cfnetserviceserror)
- [CFNetServiceBrowserInvalidate(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicebrowserinvalidate(_:)) — deprecated
- [CFNetServiceBrowserScheduleWithRunLoop(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicebrowserschedulewithrunloop(_:_:_:)) — deprecated
- [CFNetServiceBrowserCreate(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicebrowsercreate(_:_:_:)) — deprecated
- [CFNetServiceBrowserGetTypeID()](https://developer.apple.com/documentation/cfnetwork/cfnetservicebrowsergettypeid()) — deprecated
- [CFNetServiceBrowserSearchForDomains(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicebrowsersearchfordomains(_:_:_:)) — deprecated
- [CFNetServiceBrowserSearchForServices(_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicebrowsersearchforservices(_:_:_:_:)) — deprecated
- [CFNetServiceBrowserStopSearch(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicebrowserstopsearch(_:_:)) — deprecated
- [CFNetServiceBrowserUnscheduleFromRunLoop(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicebrowserunschedulefromrunloop(_:_:_:)) — deprecated
- [CFNetServiceCancel(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicecancel(_:)) — deprecated
- [CFNetServiceCreate(_:_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicecreate(_:_:_:_:_:)) — deprecated
- [CFNetServiceCreateCopy(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicecreatecopy(_:_:)) — deprecated
- [CFNetServiceCreateDictionaryWithTXTData(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicecreatedictionarywithtxtdata(_:_:)) — deprecated
- [CFNetServiceCreateTXTDataWithDictionary(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicecreatetxtdatawithdictionary(_:_:)) — deprecated
- [CFNetServiceGetAddressing(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicegetaddressing(_:)) — deprecated
- [CFNetServiceGetDomain(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicegetdomain(_:)) — deprecated
- [CFNetServiceGetName(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicegetname(_:)) — deprecated
- [CFNetServiceGetPortNumber(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicegetportnumber(_:)) — deprecated
- [CFNetServiceGetTXTData(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicegettxtdata(_:)) — deprecated
- [CFNetServiceGetTargetHost(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicegettargethost(_:)) — deprecated
- [CFNetServiceGetType(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicegettype(_:)) — deprecated
- [CFNetServiceGetTypeID()](https://developer.apple.com/documentation/cfnetwork/cfnetservicegettypeid()) — deprecated
- [CFNetServiceMonitorCreate(_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicemonitorcreate(_:_:_:_:)) — deprecated
- [CFNetServiceMonitorGetTypeID()](https://developer.apple.com/documentation/cfnetwork/cfnetservicemonitorgettypeid()) — deprecated
- [CFNetServiceMonitorInvalidate(_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicemonitorinvalidate(_:)) — deprecated
- [CFNetServiceMonitorScheduleWithRunLoop(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicemonitorschedulewithrunloop(_:_:_:)) — deprecated
- [CFNetServiceMonitorStart(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicemonitorstart(_:_:_:)) — deprecated
- [CFNetServiceMonitorStop(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicemonitorstop(_:_:)) — deprecated
- [CFNetServiceMonitorUnscheduleFromRunLoop(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicemonitorunschedulefromrunloop(_:_:_:)) — deprecated
- [CFNetServiceRegisterWithOptions(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetserviceregisterwithoptions(_:_:_:)) — deprecated
- [CFNetServiceResolveWithTimeout(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetserviceresolvewithtimeout(_:_:_:)) — deprecated
- [CFNetServiceSetClient(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicesetclient(_:_:_:)) — deprecated
- [CFNetServiceSetTXTData(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetservicesettxtdata(_:_:)) — deprecated
- [CFNetServiceUnscheduleFromRunLoop(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetserviceunschedulefromrunloop(_:_:_:)) — deprecated
- [CFNetServiceScheduleWithRunLoop(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfnetserviceschedulewithrunloop(_:_:_:)) — deprecated

### Streams

- [CFReadStreamCreateForHTTPRequest(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfreadstreamcreateforhttprequest(_:_:)) — deprecated
- [CFReadStreamCreateForStreamedHTTPRequest(_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfreadstreamcreateforstreamedhttprequest(_:_:_:)) — deprecated
- [kCFStreamPropertyHTTPAttemptPersistentConnection](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttpattemptpersistentconnection) — deprecated
- [kCFStreamPropertyHTTPFinalRequest](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttpfinalrequest) — deprecated
- [kCFStreamPropertyHTTPFinalURL](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttpfinalurl) — deprecated
- [kCFStreamPropertyHTTPProxy](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttpproxy) — deprecated
- [kCFStreamPropertyHTTPProxyHost](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttpproxyhost) — deprecated
- [kCFStreamPropertyHTTPProxyPort](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttpproxyport) — deprecated
- [kCFStreamPropertyHTTPRequestBytesWrittenCount](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttprequestbyteswrittencount) — deprecated
- [kCFStreamPropertyHTTPResponseHeader](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttpresponseheader) — deprecated
- [kCFStreamPropertyHTTPSProxyHost](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttpsproxyhost) — deprecated
- [kCFStreamPropertyHTTPSProxyPort](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttpsproxyport) — deprecated
- [kCFStreamPropertyHTTPShouldAutoredirect](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyhttpshouldautoredirect) — deprecated
- [CFWriteStreamCreateWithFTPURL(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfwritestreamcreatewithftpurl(_:_:)) — deprecated
- [CFReadStreamCreateWithFTPURL(_:_:)](https://developer.apple.com/documentation/cfnetwork/cfreadstreamcreatewithftpurl(_:_:)) — deprecated
- [kCFStreamPropertyFTPAttemptPersistentConnection](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpattemptpersistentconnection) — deprecated
- [kCFStreamPropertyFTPFetchResourceInfo](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpfetchresourceinfo) — deprecated
- [kCFStreamPropertyFTPFileTransferOffset](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpfiletransferoffset) — deprecated
- [kCFStreamPropertyFTPPassword](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftppassword) — deprecated
- [kCFStreamPropertyFTPProxy](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpproxy) — deprecated
- [kCFStreamPropertyFTPProxyHost](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpproxyhost) — deprecated
- [kCFStreamPropertyFTPProxyPassword](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpproxypassword) — deprecated
- [kCFStreamPropertyFTPProxyPort](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpproxyport) — deprecated
- [kCFStreamPropertyFTPProxyUser](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpproxyuser) — deprecated
- [kCFStreamPropertyFTPResourceSize](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpresourcesize) — deprecated
- [kCFStreamPropertyFTPUsePassiveMode](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpusepassivemode) — deprecated
- [kCFStreamPropertyFTPUserName](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyftpusername) — deprecated
- [CFSocketStreamSOCKSGetError(_:)](https://developer.apple.com/documentation/cfnetwork/cfsocketstreamsocksgeterror(_:))
- [CFSocketStreamSOCKSGetErrorSubdomain(_:)](https://developer.apple.com/documentation/cfnetwork/cfsocketstreamsocksgeterrorsubdomain(_:))
- [CFStreamCreatePairWithSocketToCFHost(_:_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfstreamcreatepairwithsockettocfhost(_:_:_:_:_:)) — deprecated
- [CFStreamCreatePairWithSocketToNetService(_:_:_:_:)](https://developer.apple.com/documentation/cfnetwork/cfstreamcreatepairwithsockettonetservice(_:_:_:_:)) — deprecated
- [kCFStreamNetworkServiceType](https://developer.apple.com/documentation/cfnetwork/kcfstreamnetworkservicetype)
- [kCFStreamNetworkServiceTypeBackground](https://developer.apple.com/documentation/cfnetwork/kcfstreamnetworkservicetypebackground)
- [kCFStreamNetworkServiceTypeCallSignaling](https://developer.apple.com/documentation/cfnetwork/kcfstreamnetworkservicetypecallsignaling)
- [kCFStreamNetworkServiceTypeVideo](https://developer.apple.com/documentation/cfnetwork/kcfstreamnetworkservicetypevideo)
- [kCFStreamNetworkServiceTypeVoIP](https://developer.apple.com/documentation/cfnetwork/kcfstreamnetworkservicetypevoip) — deprecated
- [kCFStreamNetworkServiceTypeVoice](https://developer.apple.com/documentation/cfnetwork/kcfstreamnetworkservicetypevoice)
- [kCFStreamErrorDomainFTP](https://developer.apple.com/documentation/cfnetwork/kcfstreamerrordomainftp)
- [kCFStreamErrorDomainHTTP](https://developer.apple.com/documentation/cfnetwork/kcfstreamerrordomainhttp)
- [kCFStreamErrorDomainMach](https://developer.apple.com/documentation/cfnetwork/kcfstreamerrordomainmach)
- [kCFStreamErrorDomainNetDB](https://developer.apple.com/documentation/cfnetwork/kcfstreamerrordomainnetdb)
- [kCFStreamErrorDomainNetServices](https://developer.apple.com/documentation/cfnetwork/kcfstreamerrordomainnetservices)
- [kCFStreamErrorDomainSOCKS](https://developer.apple.com/documentation/corefoundation/kcfstreamerrordomainsocks)
- [kCFStreamErrorDomainSSL](https://developer.apple.com/documentation/corefoundation/kcfstreamerrordomainssl)
- [kCFStreamErrorDomainSystemConfiguration](https://developer.apple.com/documentation/cfnetwork/kcfstreamerrordomainsystemconfiguration)
- [kCFStreamErrorDomainWinSock](https://developer.apple.com/documentation/cfnetwork/kcfstreamerrordomainwinsock)
- [kCFStreamPropertyConnectionIsCellular](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyconnectioniscellular)
- [kCFStreamPropertyNoCellular](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertynocellular)
- [kCFStreamPropertyProxyLocalBypass](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertyproxylocalbypass)
- [kCFStreamPropertySOCKSPassword](https://developer.apple.com/documentation/corefoundation/kcfstreampropertysockspassword)
- [kCFStreamPropertySOCKSProxy](https://developer.apple.com/documentation/corefoundation/kcfstreampropertysocksproxy)
- [kCFStreamPropertySOCKSProxyHost](https://developer.apple.com/documentation/corefoundation/kcfstreampropertysocksproxyhost)
- [kCFStreamPropertySOCKSProxyPort](https://developer.apple.com/documentation/corefoundation/kcfstreampropertysocksproxyport)
- [kCFStreamPropertySOCKSUser](https://developer.apple.com/documentation/corefoundation/kcfstreampropertysocksuser)
- [kCFStreamPropertySOCKSVersion](https://developer.apple.com/documentation/corefoundation/kcfstreampropertysocksversion)
- [kCFStreamPropertySSLContext](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertysslcontext)
- [kCFStreamPropertySSLPeerCertificates](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertysslpeercertificates)
- [kCFStreamPropertySSLPeerTrust](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertysslpeertrust)
- [kCFStreamPropertySSLSettings](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertysslsettings)
- [kCFStreamPropertyShouldCloseNativeSocket](https://developer.apple.com/documentation/corefoundation/kcfstreampropertyshouldclosenativesocket)
- [kCFStreamPropertySocketExtendedBackgroundIdleMode](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertysocketextendedbackgroundidlemode)
- [kCFStreamPropertySocketRemoteHost](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertysocketremotehost)
- [kCFStreamPropertySocketRemoteNetService](https://developer.apple.com/documentation/cfnetwork/kcfstreampropertysocketremotenetservice)
- [kCFStreamPropertySocketSecurityLevel](https://developer.apple.com/documentation/corefoundation/kcfstreampropertysocketsecuritylevel)
- [kCFStreamSSLAllowsAnyRoot](https://developer.apple.com/documentation/cfnetwork/kcfstreamsslallowsanyroot)
- [kCFStreamSSLAllowsExpiredCertificates](https://developer.apple.com/documentation/cfnetwork/kcfstreamsslallowsexpiredcertificates)
- [kCFStreamSSLAllowsExpiredRoots](https://developer.apple.com/documentation/cfnetwork/kcfstreamsslallowsexpiredroots)
- [kCFStreamSSLCertificates](https://developer.apple.com/documentation/cfnetwork/kcfstreamsslcertificates)
- [kCFStreamSSLIsServer](https://developer.apple.com/documentation/cfnetwork/kcfstreamsslisserver)
- [kCFStreamSSLLevel](https://developer.apple.com/documentation/cfnetwork/kcfstreamssllevel)
- [kCFStreamSSLPeerName](https://developer.apple.com/documentation/cfnetwork/kcfstreamsslpeername)
- [kCFStreamSSLValidatesCertificateChain](https://developer.apple.com/documentation/cfnetwork/kcfstreamsslvalidatescertificatechain)
- [kCFStreamSocketSOCKSVersion4](https://developer.apple.com/documentation/corefoundation/kcfstreamsocketsocksversion4)
- [kCFStreamSocketSOCKSVersion5](https://developer.apple.com/documentation/corefoundation/kcfstreamsocketsocksversion5)
- [kCFStreamSocketSecurityLevelNegotiatedSSL](https://developer.apple.com/documentation/corefoundation/kcfstreamsocketsecuritylevelnegotiatedssl)
- [kCFStreamSocketSecurityLevelNone](https://developer.apple.com/documentation/corefoundation/kcfstreamsocketsecuritylevelnone)
- [kCFStreamSocketSecurityLevelSSLv2](https://developer.apple.com/documentation/corefoundation/kcfstreamsocketsecuritylevelsslv2) — deprecated
- [kCFStreamSocketSecurityLevelSSLv3](https://developer.apple.com/documentation/corefoundation/kcfstreamsocketsecuritylevelsslv3) — deprecated
- [kCFStreamSocketSecurityLevelTLSv1](https://developer.apple.com/documentation/corefoundation/kcfstreamsocketsecurityleveltlsv1)
- [CFStreamErrorHTTP](https://developer.apple.com/documentation/cfnetwork/cfstreamerrorhttp)
- [CFStreamErrorHTTPAuthentication](https://developer.apple.com/documentation/cfnetwork/cfstreamerrorhttpauthentication)
- [Secure Sockets (SOCKS) Errors](https://developer.apple.com/documentation/cfnetwork/1518266-secure-sockets-socks-errors)

### Reference

- [CFNetwork Data Types](https://developer.apple.com/documentation/cfnetwork/cfnetwork-data-types)
- [CFNetwork Enumerations](https://developer.apple.com/documentation/cfnetwork/cfnetwork-enumerations)
- [CFNetwork Constants](https://developer.apple.com/documentation/cfnetwork/cfnetwork-constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
