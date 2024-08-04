import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Component() {
  const [instanceDetails, setInstanceDetails] = useState({
    provider: "aws",
    os: "linux",
    instanceType: "t2.micro",
    region: "us-east-1",
    duration: "ondemand",
    storageType: "ebs",
    storageSize: 20,
    dataTransfer: 1,
    notificationEmail: "",
  })
  const [isNotificationSubscribed, setIsNotificationSubscribed] = useState(false)
  const handleInputChange = (field, value) => {
    setInstanceDetails((prev) => ({ ...prev, [field]: value }))
  }
  const handleNotificationEmailChange = (e) => {
    setInstanceDetails((prev) => ({ ...prev, notificationEmail: e.target.value }))
  }
  const handleSubscribeToNotifications = () => {
    setIsNotificationSubscribed(true)
  }
  const calculateCost = (instance) => {
    const { provider, instanceType, region, duration, storageType, storageSize, dataTransfer } = instance
    const instanceCost = getInstanceCost(provider, instanceType, region, duration)
    const storageCost = getStorageCost(provider, storageType, storageSize, region)
    const dataCost = getDataTransferCost(provider, dataTransfer, region)
    const total = instanceCost + storageCost + dataCost
    const daily = total
    const monthly = total * 30
    const annual = total * 365
    return { total, daily, monthly, annual }
  }
  function getInstanceCost(provider, instanceType, region, duration) {
    const instancePricing = {
      aws: {
        "t2.micro": {
          "us-east-1": { ondemand: 0.0104, "1yr": 0.0083, "3yr": 0.0058 },
          "us-west-2": { ondemand: 0.0116, "1yr": 0.0093, "3yr": 0.0065 },
          "eu-west-1": { ondemand: 0.0116, "1yr": 0.0093, "3yr": 0.0065 },
          "ap-southeast-2": { ondemand: 0.0139, "1yr": 0.0111, "3yr": 0.0078 },
        },
        "t2.small": {
          "us-east-1": { ondemand: 0.0208, "1yr": 0.0167, "3yr": 0.0117 },
          "us-west-2": { ondemand: 0.0232, "1yr": 0.0186, "3yr": 0.013 },
          "eu-west-1": { ondemand: 0.0232, "1yr": 0.0186, "3yr": 0.013 },
          "ap-southeast-2": { ondemand: 0.0278, "1yr": 0.0222, "3yr": 0.0156 },
        },
      },
      azure: {},
    }
    return instancePricing[provider][instanceType][region][duration]
  }
  function getStorageCost(provider, storageType, storageSize, region) {
    const storagePricing = {
      aws: {
        ebs: {
          "us-east-1": 0.1,
          "us-west-2": 0.11,
          "eu-west-1": 0.11,
          "ap-southeast-2": 0.13,
        },
        "ebs-optimized": {
          "us-east-1": 0.12,
          "us-west-2": 0.13,
          "eu-west-1": 0.13,
          "ap-southeast-2": 0.15,
        },
        "instance-store": {
          "us-east-1": 0.0,
          "us-west-2": 0.0,
          "eu-west-1": 0.0,
          "ap-southeast-2": 0.0,
        },
      },
      azure: {},
    }
    return (storagePricing[provider][storageType][region] * storageSize) / 30
  }
  function getDataTransferCost(provider, dataTransfer, region) {
    const dataPricing = {
      aws: {
        "us-east-1": {
          "first-gb": 0.0,
          "next-9999-gb": 0.09,
          "over-10000-gb": 0.085,
        },
        "us-west-2": {
          "first-gb": 0.0,
          "next-9999-gb": 0.09,
          "over-10000-gb": 0.085,
        },
        "eu-west-1": {
          "first-gb": 0.0,
          "next-9999-gb": 0.09,
          "over-10000-gb": 0.085,
        },
        "ap-southeast-2": {
          "first-gb": 0.0,
          "next-9999-gb": 0.11,
          "over-10000-gb": 0.105,
        },
      },
      azure: {},
    }
    if (dataTransfer <= 1) {
      return 0
    } else if (dataTransfer <= 10000) {
      return ((dataTransfer - 1) * dataPricing[provider][region]["next-9999-gb"]) / 30
    } else {
      return (
        (9999 * dataPricing[provider][region]["next-9999-gb"]) / 30 +
        ((dataTransfer - 10000) * dataPricing[provider][region]["over-10000-gb"]) / 30
      )
    }
  }
  return (
    (<div>
      <header className="bg-background shadow-md">
        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <CloudIcon className="w-6 h-6 mr-2" />
            <h1 className="text-xl font-bold">Multi Cloud Price Calculator</h1>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-background rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Instance Details</h2>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider">Cloud Provider</Label>
                <Select
                  id="provider"
                  value={instanceDetails.provider}
                  onValueChange={(e) => handleInputChange("provider", e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aws">AWS</SelectItem>
                    <SelectItem value="azure">Azure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="os">Operating System</Label>
                <Select
                  id="os"
                  value={instanceDetails.os}
                  onValueChange={(e) => handleInputChange("os", e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select OS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linux">Linux</SelectItem>
                    <SelectItem value="windows">Windows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="instance-type">Instance Type</Label>
                <Select
                  id="instance-type"
                  value={instanceDetails.instanceType}
                  onValueChange={(e) => handleInputChange("instanceType", e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Instance Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t2.micro">t2.micro</SelectItem>
                    <SelectItem value="t2.small">t2.small</SelectItem>
                    <SelectItem value="t2.medium">t2.medium</SelectItem>
                    <SelectItem value="m5.large">m5.large</SelectItem>
                    <SelectItem value="c5.xlarge">c5.xlarge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Select
                  id="region"
                  value={instanceDetails.region}
                  onValueChange={(e) => handleInputChange("region", e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                    <SelectItem value="ap-southeast-2">Asia Pacific (Sydney)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Purchasing Option</Label>
                <Select
                  id="duration"
                  value={instanceDetails.duration}
                  onValueChange={(e) => handleInputChange("duration", e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Purchasing Option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ondemand">On-Demand</SelectItem>
                    <SelectItem value="1yr">1-Year Reserved</SelectItem>
                    <SelectItem value="3yr">3-Year Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="storage-type">Storage Type</Label>
                <Select
                  id="storage-type"
                  value={instanceDetails.storageType}
                  onValueChange={(e) => handleInputChange("storageType", e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Storage Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ebs">EBS</SelectItem>
                    <SelectItem value="ebs-optimized">EBS Optimized</SelectItem>
                    <SelectItem value="instance-store">Instance Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="storage-size">Storage Size (GB)</Label>
                <Input
                  id="storage-size"
                  type="number"
                  value={instanceDetails.storageSize}
                  onChange={(e) => handleInputChange("storageSize", Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="data-transfer">Data Transfer (GB/month)</Label>
                <Input
                  id="data-transfer"
                  type="number"
                  value={instanceDetails.dataTransfer}
                  onChange={(e) => handleInputChange("dataTransfer", Number(e.target.value))} />
              </div>
            </form>
          </div>
          <div className="bg-background rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Cost Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">Instance 1</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Provider</div>
                    <div>{instanceDetails.provider.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">OS</div>
                    <div>{instanceDetails.os}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Instance Type</div>
                    <div>{instanceDetails.instanceType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Region</div>
                    <div>{instanceDetails.region}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Purchasing Option</div>
                    <div>{instanceDetails.duration}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Storage Type</div>
                    <div>{instanceDetails.storageType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Storage Size</div>
                    <div>{instanceDetails.storageSize} GB</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Data Transfer</div>
                    <div>{instanceDetails.dataTransfer} GB/month</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Daily Cost</div>
                    <div>${calculateCost(instanceDetails).daily.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Cost</div>
                    <div>${calculateCost(instanceDetails).monthly.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Annual Cost</div>
                    <div>${calculateCost(instanceDetails).annual.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                    <div>${calculateCost(instanceDetails).total.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-background rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Recommended Instances</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">Recommended Instance 1</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Provider</div>
                    <div>AWS</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">OS</div>
                    <div>Linux</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Instance Type</div>
                    <div>t2.micro</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Region</div>
                    <div>us-east-1</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Purchasing Option</div>
                    <div>On-Demand</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Storage Type</div>
                    <div>EBS</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Storage Size</div>
                    <div>20 GB</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Data Transfer</div>
                    <div>1 GB/month</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Daily Cost</div>
                    <div>$0.52</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Cost</div>
                    <div>$15.60</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Annual Cost</div>
                    <div>$189.00</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                    <div>$189.00</div>
                  </div>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">Recommended Instance 2</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Provider</div>
                    <div>AWS</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">OS</div>
                    <div>Linux</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Instance Type</div>
                    <div>t2.small</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Region</div>
                    <div>us-east-1</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Purchasing Option</div>
                    <div>On-Demand</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Storage Type</div>
                    <div>EBS</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Storage Size</div>
                    <div>40 GB</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Data Transfer</div>
                    <div>2 GB/month</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Daily Cost</div>
                    <div>$1.04</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Cost</div>
                    <div>$31.20</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Annual Cost</div>
                    <div>$378.00</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                    <div>$378.00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-background rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Notification</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  value={instanceDetails.notificationEmail}
                  onChange={handleNotificationEmailChange} />
                <Button onClick={handleSubscribeToNotifications}>
                  {isNotificationSubscribed ? "Unsubscribe" : "Subscribe"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>)
  );
}

function CloudIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>)
  );
}


function XIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>)
  );
}
