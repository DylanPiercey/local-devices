declare module "local-devices" {

    function findLocalDevices(address?: any, skipNameResolution?: boolean, arpPath?: string): Promise<findLocalDevices.IDevice[]>;

    namespace findLocalDevices
    {
        interface IDevice
        {
            name: string;
            ip: string;
            mac: string;
        }
    }

    export = findLocalDevices;
}