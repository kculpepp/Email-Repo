<script runat="server" language="ampscript">
Var @signature,@signed
Set @signature = div_pres

if @signature == "Byington" then
Set @signed = "Melissa Byington
President
CompHealth Locum Tenens
melissa.byington@comphealth.com
801.930.3180"

elseif @signature == "Sievert" then 
Set @signed = 
"Mike Sievert
President
CompHealth Permanent Placement
michael.sievert@comphealth.com
801.930.3497"

elseif @signature == "Hagler" then 
Set @signed = "Carlos Hagler
Vice President
CompHealth Permanent Placement
carlos.hagler@comphealth.com
954.837.2620"

elseif @signature == "Black" then 
Set @signed = "Tyler Black
Vice President
CompHealth Allied Staffing
tyler.black@comphealth.com
801.930.3150"

else 
Set @signed = "Sandra Raehl
President
CompHealth Allied Staffing
sandra.raehl@comphealth.com
616.975.5013"

endif
</script>


%%=v(@signed)=%%