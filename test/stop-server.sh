kill $(ps aux |grep local-mock-server |grep -v grep |awk '{print $2 }')
