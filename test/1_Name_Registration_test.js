const { assert } = require('chai');
const truffleAssertions = require('truffle-assertions');

const nameRegistrar = artifacts.require("./NameRegistration.sol");

require('chai')
    .use(require('chai-as-promised'))
    .should(); 

contract('Testing', (accounts) => {
    let instance;
    async function increase(duration) {
        return new Promise((resolve, reject) => {
            web3.currentProvider.send({
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [duration],
                id: new Date().getTime()
            }, (err, result) => {
                web3.currentProvider.send({
                    jsonrpc: '2.0',
                    method: 'evm_mine',
                    params: [],
                    id: new Date().getTime()
                }, (err, result) => {
                    resolve();
                });
            });
        });
    }
    
    before(async() => {
        instance = await nameRegistrar.new();
    })
    describe('deployment', async() => {
        it('deploys successfully', async() => {
            const address = await instance.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })

    describe('registration', async() => {
        it('should return registration details', async() => {
            const data = await instance.registration("TheTestCompany");
            data[0].should.equal("0x0000000000000000000000000000000000000000", "Address is not set to zero for unregistered names");
            data[1].toString().should.equal("0", "Valid till part is not set to 0 for unregistered name");
        })

        it('should return the price of the entered name', async() => {
            const price = await instance.chargeAmount("TheTestCompany");
            price.toString().should.equal("140000000000000000", "Price is not reflected correctly 1");
            const newPrice = await instance.chargeAmount("O");
            newPrice.toString().should.equal("10000000000000000", "Price is not reflected correctly 2");
        })

        it('should not allow users to register name with wrong chargeAmount', async() => {
            await truffleAssertions.reverts(instance.register("TheTestCompany", {value: "10000000000000000"}), "Wrong ETH price");
        })

        it('should not allow users to use Whitespaces on chain', async() => {
            const price = await instance.chargeAmount("The Test Company");
            await truffleAssertions.reverts(instance.register("The Test Company", {value: price.toString()}), "Trim whitespaces");
        })

        it('should allow users to register name with correct chargeAmount', async() => {
            const time = Math.round((new Date().getTime()) / 1000);
            const price = await instance.chargeAmount("TheTestCompany");
            await instance.register("TheTestCompany", {value: price.toString()});
            const data = await instance.registration("TheTestCompany");
            data[0].should.equal(accounts[0], "Failed to set owner correctly");
        })

        it('should not allow users to register an existing name', async() => {
            const price = await instance.chargeAmount("TheTestCompany");
            await truffleAssertions.reverts(instance.register("TheTestCompany", {value: price.toString()}), "Already registered");
        })

        it('should not allow users to register an existing name with different case', async() => {
            const price = await instance.chargeAmount("thetestcompany");
            await truffleAssertions.reverts(instance.register("thetestcompany", {value: price.toString()}), "Already registered");
            const price2 = await instance.chargeAmount("THETESTCOMPANY");
            await truffleAssertions.reverts(instance.register("THETESTCOMPANY", {value: price2.toString()}), "Already registered");
            const price3 = await instance.chargeAmount("theTestCompany");
            await truffleAssertions.reverts(instance.register("theTestCompany", {value: price3.toString()}), "Already registered");
        })

        it('should not allow users to buy during cool period', async() => {
            await increase((52*7*24*60*60) + 100); //Increase the time period to 100s after the expiration
            const price = await instance.chargeAmount("TheTestCompany");
            await truffleAssertions.reverts(instance.register("TheTestCompany", {value: price.toString()}), "Already registered");
        })

        it('should allow users to buy after the cool period', async() => {
            await increase(24*60*60); //Increase the time period to 100s after the expiration
            const price = await instance.chargeAmount("TheTestCompany");
            await instance.register("TheTestCompany", {from: accounts[1], value: price.toString()})
            const data = await instance.registration("TheTestCompany");
            data[0].should.equal(accounts[1], "Failed to set owner correctly");
        })

        it('should not allow users to extend the validity if not the owner', async() => {
            const price = await instance.chargeAmount("TheTestCompany");
            await truffleAssertions.reverts(instance.extend("TheTestCompany", {from: accounts[0], value: price.toString()}), "Not the owner");
        })

        it('should not allow users to extend the validity if not paid the correct price', async() => {
            await truffleAssertions.reverts(instance.extend("TheTestCompany", {from: accounts[1], value: "1"}), "Wrong ETH price");
        })

        it('should allow users to extend the validity', async() => {
            const price = await instance.chargeAmount("TheTestCompany");
            const data = await instance.registration("TheTestCompany");
            await instance.extend("TheTestCompany", {from: accounts[1], value: price.toString()});
            const newData = await instance.registration("TheTestCompany");
            newData[1].toString().should.equal((+data[1] + (52*7*24*60*60)).toString(), "Time not updated correctly");
        })
    })
})