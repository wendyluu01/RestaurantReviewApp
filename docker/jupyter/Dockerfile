FROM quay.io/jupyter/minimal-notebook:latest

USER root
RUN apt-get update && \
    apt-get install -y default-jdk ca-certificates-java libopenblas-dev && \
    apt-get clean && \
    update-ca-certificates -f

USER ${NB_UID}

# Set JAVA_HOME environment variable 
ENV JAVA_HOME /usr/lib/jvm/java-21-openjdk-arm64
# Set PATH environment variable
ENV PATH $JAVA_HOME/bin:$PATH

# Copy Spark configuration file
COPY ../../conf/jupyter/spark-defaults.conf /usr/local/spark/conf/spark-defaults.conf

COPY ../../requirements/jupyter/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt
