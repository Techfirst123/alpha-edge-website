Brand logos
===========
Drop each vendor's OFFICIAL logo here using these exact file names, and it will
appear automatically in the "Brands we deal in" grid on the site. Until a file
exists, the brand's name is shown as clean text instead (so the section always
looks complete).

Expected files (SVG preferred; PNG with transparent background also fine —
if you use PNG, change the extension in src/components/Technologies.jsx):

  cisco.svg        hpe.svg          aruba.svg        dell.svg
  lenovo.svg       juniper.svg      fortinet.svg     palo-alto.svg
  sophos.svg       huawei.svg       vmware.svg       ruckus.svg
  extreme.svg      arista.svg       d-link.svg       tp-link.svg
  hikvision.svg    dahua.svg        avaya.svg        polycom.svg
  alcatel-lucent.svg   brocade.svg  samsung.svg      emc.svg

Tips
- Use each vendor's official logo from their brand/press page or a reputable
  logo library. Prefer a single-colour or full-colour SVG on transparent bg.
- Logos display greyscale and colourise on hover; a clean horizontal logo works
  best. Keep them roughly similar in visual weight.
- To add or remove a brand, edit the BRANDS array in
  src/components/Technologies.jsx.

Note on usage: displaying vendor logos is standard for resellers, but please
follow each brand's logo/trademark guidelines and only show brands you are
genuinely authorised to supply.
