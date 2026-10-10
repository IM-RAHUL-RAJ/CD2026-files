import re,sys
SRC='src/'
old=''.join(open(SRC+f).read() for f in ['p1_intro_infra_iam.html','p2_vpc_sg_ec2.html','p3_access_ami_s3_lambda.html','p4_msg_ecr_rds_finale.html'])
secs={m.group(1):m.group(0) for m in re.finditer(r'<section class="slide[^"]*" data-title="([^"]+)"[\s\S]*?</section>',old)}
REN=[("Kabir via SSM","Rahul via SSM"),("Kabir's laptop","Rahul's laptop"),("Kabir's account","Rahul's account"),("Priya's account","Ananya's account"),
 ('class="avatar">K<','class="avatar">R<'),('class="avatar" style="--c:var(--amber)">M<','class="avatar" style="--c:var(--amber)">N<'),
 ("Kabir","Rahul"),("Meera","Neha"),("ChaiCart","TicketWave"),("chaicart-menu","tw-posters"),("chaicart-api","ticketwave-api"),("chaicart-db","ticketwave-db"),
 ("chaicart-v3","ticketwave-v3"),("chaicart.pem","tw-key.pem"),("chaicart","ticketwave"),("masala.jpg","poster.jpg"),("riya-intern","ishaan-intern"),("riya-lab","ishaan-lab"),("Riya","Ishaan"),
 ("No order is lost. The kitchen works at its own pace.","No payment is lost. The payment service works at its own pace."),
 (">9,000/hr<",">2M clicks<"),(">3,000/hr<",">3,000/s<"),("SQS · kitchen","SQS · e-ticket PDFs"),("Kitchen queue","PDF queue"),
 ("the kitchen processes at a steady rate","the payment service processes at a steady rate"),("the kitchen directly","the payment service directly"),("the kitchen","the payment service"),
 ("next Diwali","the next ticket drop"),("Diwali","ticket-drop day"),("orders a day","tickets a day")]
def ren(s):
    for a,b in REN: s=s.replace(a,b)
    return s
missing=[]
def sub(m):
    t=m.group(1)
    if t not in secs: missing.append(t); return ''
    return ren(secs[t])
parts=[]
for f in ['p0_head.html','p0b_add.html','s01_campus.html','s02_aws.html','s03_iam.html','s04_vpc.html','s05_compute.html','s06_elb_s3.html','s07_data.html','s08_iac_serverless.html','s09_containers.html','s10_devsecops.html','s11_run.html']:
    parts.append(re.sub(r'<!--OLD:(.+?)-->',sub,open(SRC+f).read()))
parts.append(ren(open(SRC+'p5_script.html').read()))
out=''.join(parts)
open('index.html','w').write(out)
print('missing:',missing)
print('slides:',len(re.findall(r'<section class="slide',out)))
left=re.findall(r'(?i)chaicart|kabir|meera|diwali|masala|kitchen',out)
print('leftover story words:',left[:20])
