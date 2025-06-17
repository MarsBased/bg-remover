#!/bin/bash

# Number of requests to make
NUM_REQUESTS=5

# URL to test
URL="http://localhost:8000/remove-bg?image_url=https://e00-expansion.uecdn.es/assets/multimedia/imagenes/2021/05/19/16213755719771.jpg"

# Create results_cpu_32-64 directory if it doesn't exist
mkdir -p results_cpu_32-64

# Clear previous results_cpu_32-64
rm -f results_cpu_32-64/result_*.png
rm -f results_cpu_32-64/times.txt

echo "Starting benchmark with $NUM_REQUESTS parallel requests..."
echo "Time results_cpu_32-64 (in order of completion):" > results_cpu_32-64/times.txt

# Function to make a single request and measure time
make_request() {
    local i=$1
    local start_time=$(date +%s.%N)
    
    # Make the request and capture both the response and the exit status
    if curl -X POST "$URL" --output "results_cpu_32-64/result_$i.png" -s -w "\n%{http_code}"; then
        local end_time=$(date +%s.%N)
        local execution_time=$(echo "$end_time - $start_time" | bc)
        echo "($i) $execution_time" >> results_cpu_32-64/times.txt
    else
        echo "($i) ERROR" >> results_cpu_32-64/times.txt
    fi
}

# Launch all requests in parallel
for i in $(seq 1 $NUM_REQUESTS); do
    make_request $i &
done

# Wait for all background processes to complete
wait

# Calculate statistics
echo -e "\nCalculating statistics..."
total_time=0
count=0
min_time=999999
max_time=0

while IFS=',' read -r request time; do
    if [[ $time != "ERROR" ]]; then
        total_time=$(echo "$total_time + $time" | bc)
        count=$((count + 1))
        
        # Update min and max
        if (( $(echo "$time < $min_time" | bc -l) )); then
            min_time=$time
        fi
        if (( $(echo "$time > $max_time" | bc -l) )); then
            max_time=$time
        fi
    fi
done < results_cpu_32-64/times.txt

# Calculate average
if [ $count -gt 0 ]; then
    avg_time=$(echo "scale=3; $total_time / $count" | bc)
    
    echo -e "\nresults_cpu_32-64 Summary:"
    echo "Total requests: $NUM_REQUESTS"
    echo "Successful requests: $count"
    echo "Average response time: ${avg_time}s"
    echo "Minimum response time: ${min_time}s"
    echo "Maximum response time: ${max_time}s"
    echo -e "\nDetailed results_cpu_32-64 are in results_cpu_32-64/times.txt"
else
    echo "No successful requests to calculate statistics"
fi 