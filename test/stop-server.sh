echo "Stopping server"
kill $(ps aux |grep mock-server |grep -v grep |awk '{print $2 }')
