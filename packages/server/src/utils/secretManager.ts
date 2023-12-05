// using aws sdk v3, make an integration with aws secret manager to get the secret value of Flowise_SM_RDS
import {
    SecretsManagerClient,
    GetSecretValueCommand,
    GetSecretValueCommandOutput,
    GetSecretValueCommandInput
} from '@aws-sdk/client-secrets-manager'

/**
 * @description class to integrate with aws secret manager
 */

export class SecretManager {
    private static instance: SecretManager
    private client: SecretsManagerClient
    private constructor() {
        this.client = new SecretsManagerClient({ region: process.env.AWS_REGION })
        this.injectSecretsIntoEnv()
    }
    public static getInstance(): SecretManager {
        if (!SecretManager.instance) {
            SecretManager.instance = new SecretManager()
        }
        return SecretManager.instance
    }
    /**
     * @description get secret value from aws secret manager
     * @param secretId
     * @returns
     */
    private async getSecretValue(secretId: string): Promise<string | undefined> {
        const commandInput: GetSecretValueCommandInput = {
            SecretId: secretId
        }
        const command = new GetSecretValueCommand(commandInput)
        const commandOutput: GetSecretValueCommandOutput = await this.client.send(command)
        return commandOutput.SecretString
    }

    private async injectSecretsIntoEnv(): Promise<void> {
        const secretId = process.env.FLOWISE_SM_RDS
        if (!secretId) {
            throw new Error('FLOWISE_SM_RDS is not defined')
        }
        const secretValue = await this.getSecretValue(secretId)
        if (!secretValue) {
            throw new Error('secretValue is undefined')
        }
        const secretValueJson = JSON.parse(secretValue)
        process.env.DATABASE_TYPE = secretValueJson.DATABASE_TYPE
        process.env.DATABASE_HOST = secretValueJson.DATABASE_HOST
        process.env.DATABASE_PORT = secretValueJson.DATABASE_PORT
        process.env.DATABASE_NAME = secretValueJson.DATABASE_NAME
        process.env.DATABASE_USER = secretValueJson.DATABASE_USER
        process.env.DATABASE_PASSWORD = secretValueJson.DATABASE_PASSWORD
        process.env.FLOWISE_USERNAME = secretValueJson.FLOWISE_USERNAME
        process.env.FLOWISE_PASSWORD = secretValueJson.DATABASE_PASSWORD
    }
}
